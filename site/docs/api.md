---
title: API
---

# CRUD APIs

`sGraph` generates a full fledge crud api for each type annotated with the `@model` directive in the schema definition. The generated APIs can be configured using the [@crud](/directives) directive.

```graphql
type Order @model {
    Id: ID! @primaryKey
    FirstName: String
    LastName: String
    ReportsTo: Int
    Freight: Float

    Listings: [OrderDetail] @hasMany(foreignKey: "OrderId")
}

type OrderDetail @model {
    Id: String @primaryKey
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

-   [Create](Create)
-   [Read](Read)
-   [Update](Update)
-   [Delete](Delete)

## Create

Two creation APIs are created for each model type

-   `create_model`
-   `create_models`

### Create a single model with `create_model(input: ModelInput!): Model`

```graphql
mutation {
    employee: create_employee(
        input: {
            FirstName: "Employee-11"
            LastName: "Nortwind-11"
            ReportsTo: 2
            Country: "UK"
        }
    ) {
        Manager {
            Id
            FirstName
        }
    }
}
```

### Bulk create models with `create_models(inputs: [ModelInput!]!): Models`

```graphql
mutation {
    employees: create_employees(
        inputs: [
            {
                FirstName: "Employee-12"
                LastName: "Nortwind-12"
                ReportsTo: 2
                Country: "UK"
            }
            {
                FirstName: "Employee-13"
                LastName: "Nortwind-13"
                ReportsTo: 5
                Country: "UK"
            }
        ]
    ) {
        FirstName
    }
}
```

### Bulk creates models with associations

```graphql
mutation {
    customer: create_customer(
        input: {
            Id: "AROUT-2"
            CompanyName: "Customer-1"
            Orders: [
                {
                    Id: 27066
                    EmployeeId: "8"
                    ShipName: "Sample Shipping"
                    Listings: [
                        { Id: "detail-1", UnitPrice: 10.2, ProductId: "1" }
                    ]
                }
            ]
        }
    ) {
        Id
        Orders {
            Id
            ShipName
            Listings {
                Id
                UnitPrice
            }
        }
    }
}
```

## Read

Two creation APIs are created for each defined model type

-   `find_model_by_pk`
-   ` find_models`

### Find a single model with `find_model_by_pk(id: ID!): Model`

```graphql
{
    find_order_by_pk(id: 22656) {
        Id
        ShipName
    }
}
```

### Find models with `find_models(where: ModelFilter, limit: Int, offset: Int, order_by: ModelOrder): ModelResponse`

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

#### Filtering models with `ModelFilter`

`sGraph` supports all the filtering operations supported by [sequelize](https://sequelize.org/operations)

**Basic Filtering**

| Operator | Description  |
| -------- | ------------ |
| eq       | Equals       |
| ne       | Not Equal to |
| is       | Is           |
| not      | Not          |
| or       | Or           |

**Numeric Filtering**

| Operator   | Description |
| ---------- | ----------- |
| gt         | Equals      |
| gte        | Less than   |
| lt         | Less than   |
| lte        | Less than   |
| between    | Less than   |
| notBetween | Less than   |

**String Filtering**

| Operator   | Description |
| ---------- | ----------- |
| like       | Equals      |
| notLike    | Less than   |
| startsWith | Less than   |
| endsWith   | Less than   |
| substring  | Less than   |

#### Pagination with `limit` and `offset`

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

#### OrderBy with `order_by`

```graphql
{
    orders: find_orders(order_by: { Freight: DESC }) {
        orders {
            Freight
        }
    }
}
```

### Associations

Finding models with associations

#### One-to-Many

```graphql
{
    order: find_order_by_pk(id: 22656) {
        Id
        ShipName

        Listings(limit: 2) {
            UnitPrice
        }
    }
}
```

#### One-to-One

```graphql
{
    order_details: find_orderdetail_by_pk(id: "10248/11") {
        Id

        Product {
            ProductName
        }
    }
}
```

### Aggregation

`sGraph` generates two types of aggregation by type. An aggregate type name `ModelAggregate` is create for each time with fields. e.g

| Aggregate Type | Description |
| -------------- | ----------- |
| total          | The total   |
| avg            | The average |
| min            | The min     |
| max            | The max     |
| sum            | The sum     |

-   Top level `model_aggregate` query
-   Association aggregate `field_aggregate` query

#### Top level aggregation with `model_aggregate(where: ModelAggregate)`

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

-   `update_model_by_pk`
-   `update_models`

### update_model_by_pk

```graphql
mutation {
    employee: update_employee_by_pk(id: "1", input: { FirstName: "James" }) {
        Id
        FirstName
    }
}
```

### update_models

```graphql
mutation {
    orders: update_orders(
        input: { ShipName: "xyz" }
        where: { EmployeeId: { eq: "1" } }
        limit: 5
    ) {
        affected
        records {
            ShipName
            Employee {
                Id
            }
        }
    }
}
```

## Delete

-   delete_model_by_pk
-   delete_models

### delete_model_by_pk

```graphql
mutation delete_orderdetail_by_pk(id: "10258/2") {
    affected
}
```

### delete_models

```graphql
mutation delete_orders(where: { Freight: { gte: 400 } }) {
    affected
}

```
