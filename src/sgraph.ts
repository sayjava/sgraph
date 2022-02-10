#!/usr/bin/env node
import express from 'express'
import { useTiming } from '@envelop/core'
import bodyParser from 'body-parser'
import { altairExpress } from 'altair-express-middleware'
import { ServerConfig, createHTTPGraphql } from './server'

interface SGraphConfig extends ServerConfig {
    port: number
    path: string
    ui: boolean
    cors: boolean
    tracing: boolean
}

const config: SGraphConfig = require('rc')('sgraph', {
    port: 8080,
    path: '/graphql',
    schema: 'schema.graphql',
    ui: false,
    cors: true,
    tracing: false,
})

if (!config.database) {
    throw new Error(' database is not set in the config or the command line')
}

if (!config.schema) {
    throw new Error('schema: A path to the schema definition is required')
}

const { handler, sequelize } = createHTTPGraphql(
    Object.assign(config, { plugins: [useTiming()] })
)

sequelize
    .authenticate()
    .then(() => {
        const server = express()
        server.use(bodyParser.json())

        server.use(config.path, altairExpress({ endpointURL: config.path }))

        server.post(config.path, handler)
        server.listen(config.port, () =>
            console.log(`SGraph started on ${config.port}`)
        )
    })
    .catch((e) => {
        console.error(e)
    })
