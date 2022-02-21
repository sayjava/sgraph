#!/usr/bin/env node
import { useApolloTracing } from '@envelop/apollo-tracing'
import { ServerConfig } from './server'
import { createServer } from '.'

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

const { server, sequelize } = createServer(
    Object.assign(config, { plugins: [useApolloTracing()] })
)

sequelize
    .authenticate()
    .then(() => {
        server.listen(config.port, () =>
            console.log(`SGraph started on ${config.port} on ${config.path}`)
        )
    })
    .catch(console.error)
