#!/usr/bin/env node
import express from 'express'
import { useTiming } from '@envelop/core'
import bodyParser from 'body-parser'
import { altairExpress } from 'altair-express-middleware'
import { ServerConfig, createHTTPGraphql } from './server'

interface SGraphConfig extends ServerConfig {
    port: number
    path: string
}

const config: SGraphConfig = require('rc')('sgraph', {
    port: 8080,
    path: '/graphql',
})

if (!config.databaseUrl) {
    throw new Error('databaseUrl is not set in the config or the command line')
}

if (!config.typeDefs) {
    throw new Error('typeDefs: A path to the schema definition is required')
}

const { handler, sequelize } = createHTTPGraphql(
    Object.assign(config, { plugins: [useTiming()] })
)

sequelize
    .authenticate()
    .then(() => {
        const server = express()
        server.use(bodyParser.json())
        server.use(config.path, handler)
        server.use('/', altairExpress({ endpointURL: config.path }))
        server.listen(config.port, () =>
            console.log(`SGraph started on ${config.port}`)
        )
    })
    .catch((e) => {
        console.error(e)
    })
