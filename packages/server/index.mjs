#!/usr/bin/env node
import fs from 'fs'
import rc from 'rc'
import chalk from 'chalk'
import { createServer } from '@sayjava/sgraph-core'
import { altairExpress } from 'altair-express-middleware'
import { useApolloTracing } from '@envelop/apollo-tracing'
import { useDepthLimit } from '@envelop/depth-limit';

const config = rc('sgraph', {
    port: 8080,
    path: '/graphql',
    schema: 'schema.graphql',
    ui: false,
    cors: true,
    tracing: false,
    depthLimit: 3
})

if (!config.database) {
    console.log(chalk.red('aGraph Error: database is not set in the config or the command line'))
    process.exit(-1)
}

if (!fs.existsSync(config.schema)) {
    console.log(chalk.red('sGraph Error: A path to the schema definition is required'))
    process.exit(-1)
}

const plugins = [useDepthLimit({ maxDepth: config.depthLimit })]
config.tracing && plugins.push(useApolloTracing())
const { server, sequelize } = createServer(
    Object.assign(config, { plugins })
)

const start = () => {
    sequelize
        .authenticate()
        .then(() => {
            if (config.ui) {
                server
                    .use(config.path, altairExpress({
                        endpointURL: config.path
                    }))
            }
            server
                .listen(config.port, () => {
                    const logger = (str) => console.log(chalk.green(str))
                    logger("       _____                 _        _____                          ")
                    logger("      / ____|               | |      / ____|                         ")
                    logger("  ___| |  __ _ __ __ _ _ __ | |__   | (___   ___ _ ____   _____ _ __ ")
                    logger(" / __| | |_ | '__/ _\` | '_ \| '_ \   \___ \ / _ \ '__\ \ / / _ \ '__|")
                    logger(" \__ \ |__| | | | (_| | |_) | | | |  ____) |  __/ |   \ V /  __/ |   ")
                    logger(" |___/\_____|_|  \__,_| .__/|_| |_| |_____/ \___|_|    \_/ \___|_|   ")
                    logger("                      | |                                            ")
                    logger("                      |_|                                            ")
                    logger(chalk.green(`Server is running on port ${config.port} and path ${config.path}`))
                })
        })
        .catch(console.error)
}

start()