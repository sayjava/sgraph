import { SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { extendSchemaWithDirectives } from './directives'

export const createMemory = (typeDefs: string) => {
    const composer = new SchemaComposer()

    const sequelize = new Sequelize('sqlite::memory:', {
        logging: false,
    })

    extendSchemaWithDirectives(composer)
    composer.addTypeDefs(typeDefs)
    return { composer, sequelize }
}
