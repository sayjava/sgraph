# sGraph

`sGraph` is a schema first approach graphql API server development.

## Benefits

-   Instant CRUD API from a Graphql Schema
-   Powered by [Sequelize ORM](https://https://sequelize.org). Supports all the database supported by sequelize
-   [Supports Envelope Plugins e.g JWT, `Performance`, `Caching`](https://sayjava.github.com/sgraph/plugins)
-   [Serverless compatible](https://sayjava.github.com/sgraph/middleware)
-   [Express middleware](https://sayjava.github.com/sgraph/middleware)

## Quick Start

```shell
npx @sayjava/sgraph --schema schema.graphql --database sqlite:northwind.sqlite
```

![media/screenshot.png](site/static/screenshot.png)

```graphql
type Customer @model {
    Id: String @primaryKey
    ContactName: String

    Orders: [Order] @hasMany(foreignKey: "CustomerId")
}

type Order @model {
    Id: Int @primaryKey @autoIncrement
    OrderDate: Date
    Freight: Float
    ShipName: String
    CustomerId: String

    Customer: Customer @belongsTo(sourceKey: "CustomerId")
}
```

Find customers with name starting with `Ana` and their `orders`

```graphql
{
    find_customers(
        where: { ContactName: { startsWith: "Ana" } }
        order_by: { ContactName: ASC }
        limit: 5
    ) {
        records {
            ContactName
            Orders(limit: 2) {
                ShipName
            }

            Orders_aggregate {
                max_Freight
            }
        }
    }
}
```

Find sum of freight made by a customer

```graphql
{
    find_customer_by_pk(id: "ALFKI") {
        Orders_aggregate {
            count
            sum_Freight
        }
    }
}
```

## Supported Databases

-   SQLite
-   MySQL
-   PostgresSQL
-   MariaDB
-   Microsoft SQL Server
-   Amazon Redshift
-   Snowflake’s Data Cloud
