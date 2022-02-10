---
title: Schema Definition
---

`sGraph` has a schema first approach to API development. The behavior of the API is mostly controlled by directives in the schema definition.

## Basic Model definition

```graphql
type Employee @model {
    Id: Int @primaryKey
    FirstName: String
    LastName: String
}
```

Every model requires at least one field marked as `@primaryKey` and this should correspond to the primary key field of the database

## Special Model Types

| Directive        | Description                                       | Args                                                                   | Default Behavior                                |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| `@model`         | Maps a type to a database table                   | `{tableName: String}`                                                  | The type will not be mapped to a database table |
| `@autoTimestamp` | Automatically injects `createdAt` and `updatedAt` | none                                                                   | now                                             |
| `@crud`          | Controls what CRUD API is generated for this type | `{ create: Boolean, read: Boolean, update: Boolean, delete: Boolean }` | Full crud is enabled by default                 |
| `@autoIncrement` | Marks a field to auto increment                   |                                                                        |                                                 |

## Special Field Types

| Directive  | Description     | Default Behavior                       |
| ---------- | --------------- | -------------------------------------- |
| `UUIDV1`   | Version 1 UUID. | uuidv1 will be automatically generated |
| `UUIDV4`   | dfd             | uuidv4 will be automatically generated |
| `DateTime` | dfd             | now                                    |
| `Date`     | dfd             | now                                    |

## Field Validations

`sGraph` supports all the validations supported by [Sequelize](https://sequelize.org/v7/manual/validations-and-constraints.html).Validations that

| Directive                  | Description                                       | Type |
| -------------------------- | ------------------------------------------------- | ---- |
| `@validate_isEmail`        | Maps a type to a database table                   |      |
| `@validate_isUrl`          | Automatically injects `createdAt` and `updatedAt` |      |
| `@validate_isIP`           | Controls what CRUD API is generated for this type |      |
| `@validate_isIPv4`         | Controls what CRUD API is generated for this type |      |
| `@validate_isIPv6`         | Controls what CRUD API is generated for this type |      |
| `@validate_isAlpha`        | Controls what CRUD API is generated for this type |      |
| `@validate_isAlphanumeric` | Controls what CRUD API is generated for this type |      |
| `@validate_isNumeric`      | Controls what CRUD API is generated for this type |      |
| `@validate_isLowercase`    | Controls what CRUD API is generated for this type |      |
| `@validate_isUppercase`    | Controls what CRUD API is generated for this type |      |
| `@validate_notEmpty`       | Controls what CRUD API is generated for this type |      |
| `@validate_equals`         | Controls what CRUD API is generated for this type |      |
| `@validate_isDate`         | Controls what CRUD API is generated for this type |      |
| `@validate_isCreditCard`   | Controls what CRUD API is generated for this type |      |
| `@validate_contains`       | Controls what CRUD API is generated for this type |      |
| `@validate_isUUID`         | Controls what CRUD API is generated for this type |      |
| `@validate_len`            | Controls what CRUD API is generated for this type |      |
| `@validate_isAfter`        | Controls what CRUD API is generated for this type |      |
| `@validate_isBefore`       | Controls what CRUD API is generated for this type |      |
| `@validate_max`            | Controls what CRUD API is generated for this type |      |
| `@validate_max`            | Controls what CRUD API is generated for this type |      |
| `@validate_is`             | Controls what CRUD API is generated for this type |      |
| `@validate_not`            | Controls what CRUD API is generated for this type |      |

## A full Model Definition

```graphql
"""
sGraph will generate a Read-Only API for this type
"""
type Employee
    @model(tableName: 'employees')
    @autoTimestamp
    @crud(create: false, update: false, delete: false) {

    id: UUIDV4! @primaryKey

    logs: Int! @autoIncrement

    """ Must be an email format """
    """ Maps this field to a different table column  """
    email: String @validate_isEmail @column(name: 'employee_email')

    """ Must be a URL format """
    url: String @validate_isUrl

    """ Must be a phone number """
    phoneNumber:  @validate_isNumeric

    """ No date will be accepted after this date """
    registeredDate: Date  @validate_isBefore(value: '27-04-1990')

    """ Postcode must contain ECR1  """
    postcode: String  @validate_contains(value: 'ECR1')
}
```
