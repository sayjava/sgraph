---
title: API
position: 4
category: Guide
---

`sGraph` generates a full CRUD API for each type annotated with the `@model` directive in the schema definition. The generated APIs can be further tuned using the [@crud](/directives) directive. Any of this APIs can be disabled.

This schema will be used in this documentation to illustrate the usage of the different APIs available for the defined model types

```graphql
type Order @model {
    Id: ID! @primaryKey
    ShipAddress: String
    ShipCountry: String
    OrderDate: Date
    Freight: Float

    Listings: [OrderDetail] @hasMany(foreignKey: "OrderId")
}

type OrderDetail @model {
    Id: String @primaryKey @autoIncrement
    Quantity: Float
    UnitPrice: Float
    ProductId: String

    Product: Product @belongsTo(sourceKey: "ProductId")
}

type Product @model {
    Id: Int @primaryKey @autoIncrement
    ProductName: String
    UnitPrice: Float
}
```

## Create

Records are created with mutation operations. All the defined validations on the fields will be executed before the final insertion into the database. Special scalar fields like `URL`, `Email` e.t.c are automatically validate prior to insertion into the database.

### Available Operations

-   `create_[model] ([model]: ModelInput!) `
-   `create_[models] ([models]: [Model!]!)`

### Single record creation

Creating new records is achieved using the create mutation

**Example**
Create an order in the `Order` table in the database

```graphql
mutation {
    create_order(
        order: {
            ID: 200
            ShipAddress: "New Shipping Address"
            ShipCountry: "UK"
            Freight: 10
            OrderDate: "07-11-2022"
        }
    ) {
        ShipAddress
    }
}
```

### Bulk record creation

Records can be created in bulk with all the validations on the data respected for each inserted record

**Example**
Create multiple orders in the `Order` table in the database

```graphql
mutation {
    create_orders(
        orders: [
            {
                ID: 201
                ShipAddress: "New Shipping Address 1"
                ShipCountry: "UK"
                Freight: 10
                OrderDate: "07-11-2022"
            }
            {
                ID: 202
                ShipAddress: "New Shipping Address 2"
                ShipCountry: "UK"
                Freight: 10
                OrderDate: "07-11-2022"
            }
        ]
    ) {
        ShipAddress
    }
}
```

### Bulk records creation with associations

Records can be created with their associations in a single operation. It works both in single and bulk record creation.

**Example**
Create an order and also `Listings`(i.e OrderDetail). The second `listing` will also create a `Product` automatically

```graphql
mutation {
    create_order(
        order: {
            Id: 203
            ShipAddress: "New Shipping Address 2"
            ShipCountry: "UK"
            Freight: 10
            OrderDate: "07-11-2022"
            Listings: [
                { Quantity: 10, UnitPrice: 4.5, ProductId: 3 }
                {
                    Quantity: 10
                    UnitPrice: 4.5
                    Product: {
                        ProductName: "Fancy new product"
                        UnitPrice: 3.2
                    }
                }
            ]
        }
    ) {
        ShipAddress
        Listings {
            Quantity
            Product {
                ProductName
            }
        }
    }
}
```

## Read

`sGraph` generates GraphQL query operations that enables the fetching, searching and aggregation of records from the underlying database.

### Available Operations

-   `find_by_pk (id: ID!) `
-   `find_[models] (where: Filter!, limit: Int, offset: Int)`
-   `[model]_aggregate (where: Filter!, limit: Int, offset: Int)`

### Find by primary key

A single record can be retrieved from the underlying database using the primary key of that record.

#### Arguments

| Argument | Description           |
| -------- | --------------------- |
| id       | The primary key field |

**Example**
Find a single order with the `Id` of `22656`

```graphql
{
    find_order_by_pk(id: 22656) {
        Id
        ShipName
    }
}
```

### Find by filtering

A `[Model]FilterInput` is generated for each defined type in the schema. Each filter uses the fields on the type for searching and filtering data from the underlying database table.

#### Arguments

| Argument | Description                                 |
| -------- | ------------------------------------------- |
| where    | The `ModelFilter` for this type.            |
| offset   | Skip the number of records returned         |
| limit    | Limit the number of records returned        |
| order_by | The `ModelOrderBy` for sorting this record. |

**Example**

Find orders where `OrderDate` `startsWith` `2015-08-12` and limit the response 5 records.

```graphql
{
    find_orders(where: { OrderDate: { startsWith: "2015-08-12" } }, limit: 5) {
        count
        orders {
            Id
            OrderDate
        }
    }
}
```

Because `sGraph` is powered by `Sequelize ORM`, the filtering mechanism is therefore powered by the filtering operations of [Sequelize](https://sequelize.org/operations). Here are the filtering supported by `sGraph`'s Filtering mechanism.

#### Basic Filtering

These filtering operations are available on all fields regardless of type

| Operator | Description  |
| -------- | ------------ |
| eq       | Equals       |
| ne       | Not Equal to |
| is       | Is           |
| not      | Not          |
| or       | Or           |

#### Numeric Filtering

These filtering operations are available on all numeric fields in addition to the basic operations

| Operator   | Description |
| ---------- | ----------- |
| gt         | Equals      |
| gte        | Less than   |
| lt         | Less than   |
| lte        | Less than   |
| between    | Less than   |
| notBetween | Less than   |

#### String Filtering

These filtering operations are available on all string fields in addition to the basic operations

| Operator   | Description |
| ---------- | ----------- |
| like       | Equals      |
| notLike    | Less than   |
| startsWith | Less than   |
| endsWith   | Less than   |
| substring  | Less than   |

#### Logical Filtering

Filters can be combined for logical filtering on records to make even more complex filtering scenarios

`and` logical filtering

```graphql
{
    find_orders(
        where: {
            and: [
                { ShipName: { startsWith: "Seven" } }
                { Freight: { eq: 10 } }
            ]
        }
    ) {
        count
        orders {
            CustomerId
            ShipName
        }
    }
}
```

`or` logical filtering

```graphql
{
    find_orders(
        where: {
            or: [{ ShipName: { startsWith: "Seven" } }, { Freight: { eq: 10 } }]
        }
    ) {
        count
        orders {
            CustomerId
            ShipName
        }
    }
}
```

#### Association Filtering

Associations can also be filtered exactly as their parent

**Example**:

-   Find an order with the Id `22656`
-   get the `Listings` filtered by `Quantity`
-   get the related product of the listing

```graphql
    find_order_by_pk(id: 22656) {
        Id
        ShipName

        Listings (where: { Quantity: { gte: 10 } }) {
            Product {
                ProductName
            }
        }
    }
```

### Pagination

Records can be paged from the database with `offset` and `limit`

**Example** List orders from the `Order` table, offset by 5 records and limit to 5 records

```graphql
{
    orders: find_orders(offset: 5, limit: 5) {
        count
        orders {
            Id
            OrderDate
        }
    }
}
```

### Ordering

Records can be sorted from the database with a `OrderBy` enum that is auto generated for each field of the defined type.

**Example**

List orders limited to 10 records and `order by` `Freight`

```graphql
{
    orders: find_orders(order_by: { Freight: DESC }, limit: 10) {
        orders {
            Freight
        }
    }
}
```

### Aggregation

`sGraph` supports aggregate operations on the underlying database. An aggregate operation is generated for each defined type. Each numeric field of a type can be used for aggregation of that type.

These are the supported aggregation types for every numeric field.

| Aggregate Type | Description                    |
| -------------- | ------------------------------ |
| total          | The total sum of the field     |
| avg            | The average value of the field |
| min            | The minimum value of the field |
| max            | The maximum value of the field |
| sum            | The sum of all the values      |

#### Top level aggregation

Every defined `@model` type can be aggregated directly using the generated `[model]_aggregate` operation

**Example** Aggregate on all `Freight` of orders greater than 400

```graphql
query {
    order_aggregate(where: { Freight: { gt: 400 } }) {
        count
        total_Freight
        avg_Freight
        min_Freight
        sum_Freight
        max_Freight
    }
}
```

#### Association aggregation

Associations that can also be aggregated upon similarly as top level aggregates.

**Example**

Aggregates on `Listings`' `UnitPrice` of an order with `Id` `20167`.

```graphql
query {
    order: find_order_by_pk(id: 20167) {
        ShipName
        Listings_aggregate(where: { UnitPrice: { gte: 40 } }) {
            count
            avg_UnitPrice
            min_UnitPrice
            sum_UnitPrice
            max_UnitPrice
        }
    }
}
```

## Update

Records can be updated using the mutation operation generated for each defined `@model` type. This operation can be disabled using the `@crud( update: false )` directive on the [model definition](/docs/guide/schema).

### Available Operations

-   `update_by_pk (id: ID!) `
-   `update_[models] (where: Filter!, limit: Int)`

### Update with a single record

Single records can be updated using their primary key

**Example**
Update an order with an `Id` of `11` with the new order data

```graphql
mutation {
    update_orders_by_pk(
        id: 11
        order: { ShipAddress: "A new address to ship to" }
    ) {
        Id
        FirstName
    }
}
```

### Update multiple records

Multiple records can be updated simultaneously using the same filter used for filtering records from the database.

**Example**
Update multiple orders where the `Freight` is equal to 2 using a filter and limited to the first 5 records.

```graphql
mutation {
    update_orders(
        order: { ShipAddress: "The new address" }
        where: { Freight: { eq: 2 } }
        limit: 5
    ) {
        affected
        orders {
            ShipName
            Employee {
                Id
            }
        }
    }
}
```

## Delete

Records can be deleted using the mutation operation generated for each defined `@model` type. This operation can be disabled using the `@crud( delete: false )` directive on the [model definition](/docs/guide/schema).

Cascade deletion rules will follow the rules set out in the [association definition](/docs/guide/schema) rules and database rules.

### Available Operations

-   `delete_by_pk (id: ID!) `
-   `delete_[models] (where: Filter!, limit: Int)`

### Delete a single record

Single records can be deleted using their primary key

**Example**
Delete an order with the primary key `10258/2`

```graphql
mutation delete_order_by_pk( id: 2 ) {
    affected
}
```

### Delete multiple records

Multiple records can be deleted simultaneously using the same filter used for filtering records from the database.

**Example**
This will delete orders with `Freight` greater than 400 but limited to a total 2 records

```graphql
mutation delete_orders( where: { Freight: { gte: 400 } }, limit: 2 ) {
    affected
}

```
