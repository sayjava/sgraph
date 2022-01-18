import { graphqlHTTP } from 'express-graphql'

import { schemaComposer, SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize/dist'
import { createTypeModels } from './models'
import { createInputFilters } from './filters'
import { createRelationships } from './relationships'
import { createResolvers } from './resolvers'
import { createOder } from './order'
import { getModelTypes } from './utils'
import { createAggregates } from './resolvers/aggregate'

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

    const types = getModelTypes(composer)

    createTypeModels({ types, sequelize })
    createInputFilters({ types, sequelize })
    createOder({ types, sequelize })
    createRelationships({ types, sequelize })
    createResolvers({ types, sequelize })
    createAggregates({ types, sequelize })

    return graphqlHTTP({
        schema: composer.buildSchema(),
        context: {},
        graphiql: enabledUI,
    })
}
