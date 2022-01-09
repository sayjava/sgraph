import { graphqlHTTP } from 'express-graphql'

import { schemaComposer, SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize/dist'
import { createTypeModels } from './models'
import { createInputFilters } from './filters'
import { createRelationships } from './relationships'
import { createResolvers } from './resolvers'
import { createOder } from './order'

export interface ServerConfig {
    typeDefs: string
    enabledUI?: boolean
    composer?: SchemaComposer
    sequelize?: Sequelize
}

export const createHTTPGraphql = ({
    typeDefs,
    enabledUI,
    sequelize = new Sequelize('sqlite::memory:'),
    composer = schemaComposer,
}: ServerConfig) => {
    composer.addTypeDefs(typeDefs)
    createTypeModels({ composer, sequelize })
    createInputFilters({ composer, sequelize })
    createOder({ composer, sequelize })
    createRelationships({ composer, sequelize })
    createResolvers({ composer, sequelize })

    return graphqlHTTP({
        schema: composer.buildSchema(),
        context: {},
        graphiql: enabledUI,
    })
}
