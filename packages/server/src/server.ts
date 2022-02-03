import type { IncomingMessage, ServerResponse } from 'http'
import { graphqlHTTP } from 'express-graphql'
import { SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { readFileSync, existsSync } from 'fs'
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

export const createHTTPGraphql = ({
    typeDefs,
    graphiql,
    databaseUrl,
    logging,
}: ServerConfig): HttpGraphql => {
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

    const handler = graphqlHTTP({
        graphiql,
        schema: composer.buildSchema(),
        context: { sequelize },
    })

    return { handler, composer, sequelize }
}
