# Model definition

## Define a Model

### `@model`

```graphql
type Employee @model {
    Id: Int @primaryKey @autoIncrement
    FirstName: String
    LastName: String
}
```

### `@autoTimestamp`

```graphql
type Employee @autoTimestamp {
    Id: ID!
}
```

`sGraph` will automatically create two fields `createdAt` and `updatedAt` in the database and will be available for query.

now, timestamps can be queried

```graphql
find_employees {
    createdAt
    updatedAt
}
```

### `@primaryKey`

Mark a field as the primary key of the table

### `@autoIncrement`

### `@column`

### `@unique`
