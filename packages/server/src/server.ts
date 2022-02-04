import type { IncomingMessage, ServerResponse } from 'http'
import { graphqlHTTP } from 'express-graphql'
import { SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { readFileSync, existsSync } from 'fs'
import { envelop, useSchema, Plugin } from '@envelop/core'

import { createTypeModels } from './models'
import { createInputFilters } from './filters'
import { createRelationships } from './relationships'
import { createResolvers } from './resolvers'
import { createOder } from './order'
import { getModelTypes } from './utils'
import { createAggregates } from './resolvers/aggregate'
import { extendSchemaWithDirectives } from './directives'

export interface ServerConfig {
    /**
     * Type definition or type definition path
     */
    typeDefs: string

    /**
     *
     */
    graphiql?: boolean

    /**
     *
     */
    databaseUrl: string

    /**
     * Log SQL Statements
     */
    logging?: any

    /**
     * Envelope Plugins
     */
    plugins?: Plugin[]
}

export type GraphqlHandler = (
    request: IncomingMessage & { url: string },
    response: ServerResponse & { json?: (data: unknown) => void }
) => Promise<void>

export interface HttpGraphql {
    handler: GraphqlHandler
    sequelize: Sequelize
    composer: SchemaComposer
}

const createComposer = (defs: string): SchemaComposer => {
    const composer = new SchemaComposer()
    extendSchemaWithDirectives(composer)

    if (existsSync(defs)) {
        const typeDefs = readFileSync(defs, 'utf-8')
        composer.addTypeDefs(typeDefs)
        return composer
    }

    composer.addTypeDefs(defs)
    return composer
}

export const createHTTPGraphql = (config: ServerConfig): any => {
    const { typeDefs, graphiql, databaseUrl, logging, plugins = [] } = config
    const composer = createComposer(typeDefs)

    const sequelize = new Sequelize(databaseUrl, {
        logging,
        logQueryParameters: !!logging,
    })

    const types = getModelTypes(composer)
    createTypeModels({ types, sequelize })
    createInputFilters({ types, sequelize })
    createOder({ types, sequelize })
    createRelationships({ types, sequelize })
    createResolvers({ types, sequelize })
    createAggregates({ types, sequelize })

    const baseSchema = composer.buildSchema()
    const getEnveloped = envelop({
        plugins: [useSchema(baseSchema), ...plugins],
    })

    const handler = graphqlHTTP(async (req) => {
        const { schema, contextFactory } = getEnveloped({ req })
        const context = await contextFactory({ sequelize })
        return { schema, graphiql, context }
    })

    return { handler, composer, sequelize }
}
