import type { IncomingMessage, ServerResponse } from 'http'
import { SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { readFileSync, existsSync } from 'fs'
import { envelop, useSchema, Plugin } from '@envelop/core'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

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
    schema: string

    /**
     *
     */
    database: string

    /**
     * Log SQL Statements
     */
    logging?: any

    /**
     * Envelope Plugins
     */
    plugins?: Plugin[]

    /**
     * Cors
     */
    cors?: boolean

    /**
     * path to mount
     */
    path: string
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
    const { schema: typeDefs, database, logging, plugins = [] } = config
    const composer = createComposer(typeDefs)

    const sequelize = new Sequelize(database, {
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

    const handler = async (req, res) => {
        try {
            const { parse, validate, contextFactory, execute, schema } =
                getEnveloped({ req })

            const { query, variables } = req.body
            const document = parse(query)
            const validationErrors = validate(schema, document)

            if (validationErrors.length > 0) {
                return res.json({
                    errors: validationErrors,
                })
            }

            const context = await contextFactory()
            const result = await execute({
                document,
                schema,
                variableValues: variables,
                contextValue: context,
            })

            res.set('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
        } catch (error) {
            console.error(error)
            res.json({ errors: [error] })
        }
    }

    return { handler, composer, sequelize }
}

export const createServer = (config: ServerConfig) => {
    const server = express()
    const { handler, sequelize } = createHTTPGraphql(config)

    // auto sync memory databases
    config.database === 'sqlite::memory:' && sequelize.sync()

    config.cors && server.use(cors({ origin: '*' }))
    server.use(bodyParser.json())
    server.post(config.path, handler)

    return { server, sequelize }
}
