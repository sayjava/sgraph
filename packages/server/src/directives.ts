import { SchemaComposer } from 'graphql-compose'

export const extendSchemaWithDirectives = (composer: SchemaComposer) => {
    // models
    // TODO: Add database types
    // TODO: Add @timestamps
    // TODO: Add @unique
    // TODO: Add @autoIncrement
    // TODO: Add @default
    composer.addTypeDefs(
        `
    """ Marks this type as a model """
    directive @model(
      """ An alternative tablee name for this model in the database  """
      tableName: String
    ) on OBJECT

    """ Renames a column """
    directive @column(name: String) on FIELD_DEFINITION

    """ Marks the field as a primary key"""
    directive @primaryKey on FIELD_DEFINITION

    """ Marks the field as a primary key"""
    directive @unique on FIELD_DEFINITION

    """ Relationships """
    directive @hasOne(
      foreignKey: String
      sourceKey: String
      onDelete: String
      onUpdate: String
      through: String
    ) on FIELD_DEFINITION

    directive @belongsTo(
      foreignKey: String
      sourceKey: String
      onDelete: String
      onUpdate: String
      through: String
    ) on FIELD_DEFINITION

    directive @hasMany(
      foreignKey: String
      sourceKey: String
      onDelete: String
      onUpdate: String
      through: String
    ) on FIELD_DEFINITION

    directive @belongsToMany(
      foreignKey: String
      sourceKey: String
      targetKey: String
      onDelete: String
      onUpdate: String
      through: String
    ) on FIELD_DEFINITION

    `
    )
}
