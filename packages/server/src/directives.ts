import { SchemaComposer } from 'graphql-compose'

export const extendSchemaWithDirectives = (composer: SchemaComposer) => {
    // models
    // TODO: Add database types
    // TODO: Add @timestamps
    // TODO: Add @unique
    // TODO: Add @autoIncrement
    // TODO: Add @default
    // TODO: custom column names
    composer.addTypeDefs(
        `
    """ Marks this type as a model """
    directive @model(
      """ An alternative tablee name for this model in the database  """
      tableName: String
    ) on OBJECT

     """ Marks this type as a model """
    directive @primaryKey on FIELD_DEFINITION
    `
    )
}
