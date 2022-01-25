import { SchemaComposer } from 'graphql-compose'

export const extendSchemaWithDirectives = (composer: SchemaComposer) => {
    // models
    // TODO: Add database types
    // TODO: Add @timestamps
    // TODO: Add @default
    composer.addTypeDefs(
        `
    """ Marks this type as a model """
    directive @model(
      """ An alternative tablee name for this model in the database  """
      tableName: String
    ) on OBJECT

    """ Enable AutoTimestamp  """
    directive @autoTimestamp on FIELD_DEFINITION

    """ Renames a column """
    directive @column(name: String) on FIELD_DEFINITION

    """ Marks the field as a primary key"""
    directive @primaryKey on FIELD_DEFINITION

    """ Marks the field as a unique key"""
    directive @unique on FIELD_DEFINITION

    """ Auto increment """
    directive @autoIncrement on FIELD_DEFINITION
    
    """ UUID  """
    directive @uuidv4 on FIELD_DEFINITION
    directive @uuidv1 on FIELD_DEFINITION
    
    directive @dateTime on FIELD_DEFINITION
    directive @date on FIELD_DEFINITION

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


    """ Validation """
    directive @validate_isEmail            on FIELD_DEFINITION 
    directive @validate_isUrl              on FIELD_DEFINITION 
    directive @validate_isIP               on FIELD_DEFINITION 
    directive @validate_isIPv4             on FIELD_DEFINITION 
    directive @validate_isIPv6             on FIELD_DEFINITION 
    directive @validate_isAlpha            on FIELD_DEFINITION 
    directive @validate_isAlphanumeric     on FIELD_DEFINITION 
    directive @validate_isNumeric          on FIELD_DEFINITION 
    directive @validate_isLowercase        on FIELD_DEFINITION 
    directive @validate_isUppercase        on FIELD_DEFINITION 
    directive @validate_notEmpty           on FIELD_DEFINITION 
    directive @validate_equals             on FIELD_DEFINITION 
    directive @validate_isDate             on FIELD_DEFINITION
    directive @validate_isCreditCard       on FIELD_DEFINITION

    directive @validate_contains           (value: String!)     on FIELD_DEFINITION
    directive @validate_isUUID             (value: Int!)        on FIELD_DEFINITION
    directive @validate_len                (value: [String!]!)  on FIELD_DEFINITION
    directive @validate_isAfter            (value: String!)     on FIELD_DEFINITION
    directive @validate_isBefore           (value: String!)     on FIELD_DEFINITION
    directive @validate_max                (value: Int!)        on FIELD_DEFINITION
    directive @validate_min                (value: Int!)        on FIELD_DEFINITION
    directive @validate_is                 (value: String!)     on FIELD_DEFINITION
    directive @validate_not                (value: String!)     on FIELD_DEFINITION
    `
    )
}
