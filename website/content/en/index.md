---
title: sGraph
description: 'GraphQL Application Server'
position: 1
category: ''
fullscreen: true
features:
    - Instant CRUD API from a Graphql Schema
    - Extensive field filtering API. startsWith, gt, isNot e.t.c
    - Extensive field aggregation API. max, min, avg e.t.c
---

## What is sGraph?

`sGraph` is a schema driven GraphQL API server powered by the trusted [Sequelize SQL ORM Library](https://sequelize.org).

It is easy in 3 steps

-   Define a graphql schema
-   Provide database credentials
-   Get back an API

**with a simple schema like this (schema.graphql)**

```graphql schema.graphql
type Customer @model {
    Id: ID
    ContactName: String
    Orders: [Order] @hasMany
}

type Order @model {
    Id: Int @primaryKey @autoIncrement
    OrderDate: Date
    Freight: Float
    CustomerId: String
    Customer: Customer @belongsTo
}
```

and start the server

```shell
npx @sayjava/sgraph --schema schema.graphql --database sqlite::memory:
```

<code-group>
  <code-block label="Create" active>

```graphql
mutation {
    create_customer(
        customer: {
            Id: "first-customer"
            ContactName: "John Doe"
            Orders: [
                { OrderDate: "2021-06-01", Freight: 20 }
                { OrderDate: "2021-06-01", Freight: 10 }
            ]
        }
    ) {
        Id
    }
}
```

  </code-block>
  <code-block label="Find">

```graphql
query {
    find_customers(where: { ContactName: { startsWith: "John" } }, limit: 10) {
        count
        customers {
            ContactName
            Orders {
                Freight
            }
            Orders_aggregate {
                max_Freight
            }
        }
    }
}
```

  </code-block>

  <code-block label="Update">

```graphql
mutation {
    update_customer_by_pk(
        id: "first-customer"
        data: { ContactName: "new-name" }
    ) {
        ContactName
    }
}
```

</code-block>

  <code-block label="Delete">

```graphql
mutation {
    delete_customers(where: { Id: { eq: "first-customer" } }) {
        affected
    }
}
```

  </code-block>
</code-group>
