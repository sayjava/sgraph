<div align="center">
  <h1>sGraph</h1>
  <h3 align="center">Turn your graphql schema into a full API</h3>
  <div>
    <a href="https://www.sgraph.dev/docs/getting-started/quickstart">Quickstart</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://www.sgraph.dev/">Website</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://www.sgraph.dev/docs/">Docs</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://github.com/sgraph/examples/">Examples</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://twitter.com/sayhava">Twitter</a>
  </div>
</div>

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
    Id: Int @primaryKey
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

**you get a GraphQL API like this**

```graphql
{
    find_customers(where: { ContactName: { startsWith: "Anne" } }, limit: 10) {
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

## Features

-   Instant CRUD API from a Graphql Schema
-   Extensive field filtering API. `startsWith`, `gt`, `isNot` e.t.c
-   Extensive field aggregation API. `max`, `min`, `avg` e.t.c
-   Builtin field validations with directives. e.g `@validate_max(value: 20)`, `@validate_len(value: [2, 10])` e.t.c
-   Readable scalar fields with validation e.g `URL`, `Email`, `Date` e.t.c
-   Powered by [Sequelize ORM](https://sequelize.org). Supports all the databases supported by sequelize. (`MySQL`, `SQLite`, `Postgresql`) e.t.c
-   Supports [Envelop Plugins](https://www.envelop.dev) Plugins e.g `JWT`, `Performance`, `Caching`
-   Serverless ready
-   Programmable via express middleware

## sGraph use cases

-   Quickly spin up a GraphQL API for an existing database
-   Generate read-only public/client facing APIs
-   Eliminate redundant CRUD code
-   Spin up cheap serverless APIs for small to medium sized projects
-   Seamlessly integrate with your existing project via middleware, or serverless functions
-   Easily build access restrictions into API with a declarative schema

## Quick Start

Start a sample API with the above schema with an in memory sqlite database

with npm

```shell
npx @sayjava/sgraph --schema schema.graphql --database sqlite::memory:
```

with docker

```shell
docker run -v $(pwd):/app @sayjava/sgraph --schema /app/schema.graphql --database sqlite::memory:
```

Read the [API docs](website/docs/guide/api.md) for the full set of available APIs

# Examples & Playground

-   Northwind Sample Database
    -   [Code](northwind)
    -   [Live Playground](https://northwind.sgraph.dev)
-   Chinook Sample Database
    -   [Code](chinook)
    -   [Live Playground](https://chinook.sgraph.dev)

## sGraph Architecture

Underneath, `sGraph` maps each defined GraphQL type to [Sequelize Model](https://sequelize.org/v7/manual/model-basics.html#model-definition) which is turn mapped to a database table. `sGraph` then generates a full API for each defined type and its associations. For example, a simple definition like

```graphql
type Customer @model {
    Id: ID
    Quantity: Float
}
```

will internally yield an API like this

```mermaid
classDiagram
  direction RL


  class Query {
      find_order_by_pk(id)
      find_orders(where, limit, offset, order_by)
      order_aggregate(where, limit, offset)
  }

  class Mutations {
      create_order(order)
      create_orders(orders)

      update_order_by_pk(id, order)
      update_orders(orders)

      delete_order_by_pk(id)
      delete_orders(where, limit)
  }

  class Order {
      id: ID
      Quantity: Float
  }

  class OrderAggregate {
      count
      min_Quantity
      max_Quantity
      sum_Quantity
      total_Quantity
  }

  class OrderOrderBy {
      Quantity: OrderBy
  }

  class OrderFilter {
      id: IDFilter
      Quantity: BasicFilter | FloatFilter
  }

  class BasicFilter {
      eq: Int
      ne: Int
      is: Int
      not: Int
      or: Int []
  }

  class FloatFilter {
      eq: Int
      gte: Int
      lt: Int
      lte: Int
      between: Int[]
      notBetween: Int[]
  }

  Query o-- Order
  Mutations o-- Order
  Order -- OrderAggregate
  Order -- OrderOrderBy
  Order -- OrderFilter
  OrderFilter -- BasicFilter
  OrderFilter -- FloatFilter
```

### Integrating with envelop plugins

`sGraph` wraps its internal schema with the [Envelop](https://www.envelop.dev) framework. That means the incredible list of available [envelope plugins](https://www.envelop.dev/plugins) can be tacked on to the server to even improve its functionalities with minium code.

`sGraph` itself includes some plugins like [apolloTracing](https://www.envelop.dev/plugins/use-apollo-tracing) and [useDepthLimit](https://www.envelop.dev/plugins/use-depth-limit).

```mermaid
    classDiagram
        direction LR
        EnvelopSchema --* SGraphSchema : wraps
        EnvelopSchema --o ApolloTracingPlugin : uses
        EnvelopSchema --o DepthLimitPlugin : uses
        EnvelopSchema --o OtherPlugins : uses
        sGraphServer --*  EnvelopSchema : exposes
```

see [plugins docs](website/docs/plugins.md) on how to simply integrate new plugins into the server

## Supported Databases

All databases supported by the [Sequelize ORM](https://sequelize.org/v7/manual/getting-started.html#connecting-to-a-database) are supported by `sGraph`. The server comes bundled with `sqlite`, `postgres` and `mysql` database drivers. a quick start but for a more streamlined server, the `@sayjava/sgraph-slim` server comes just with just the basic server but the driver for the database will have to be installed.

| Database               | Dependencies   | Bundled | Connection                                     |
| ---------------------- | -------------- | ------- | ---------------------------------------------- |
| SQLite                 | `sqlite3`      | Yes     | `sqlite:path-to-file.sqlite`                   |
| Postgres               | `pg pg-hstore` | Yes     | `postgres://user:pass@example.com:5432/dbname` |
| MySQL                  | `mysql2`       | Yes     | `mysql://user:pass@example.com:5432`           |
| MariaDB                | `mariadb`      | No      | `mariadb://user:pass@example.com:5432`         |
| Microsoft SQL Server   | `tedious`      | No      | `mysql://user:pass@example.com:5432`           |
| Amazon Redshift        | `ibm_db`       | No      | `mysql://user:pass@example.com:5432`           |
| Snowflake’s Data Cloud | `odbc`         | No      | `mysql://user:pass@example.com:5432`           |

## Documentation

-   [Server Setup](website/docs/start.md)
-   [Schema Guide](website/docs/guide/schema.mdx)
-   [API Documentation](website/docs/guide/api.md)
-   [Plugin Documentation](website/docs/plugins.md)

## Programmatic Middleware

`sGraph` can be incorporated into an existing application by using it as an express middleware either in a stand alone application or as a serverless function

```js
const { createServer } = require('@sayjava/sgraph-slim')
const express = require('express')
const app = express()

const { handler: middleware } = createServer({
    database: 'databse:connection',
    schema: 'path-to-schema',
    cors: true

    // list of instantiated envelop plugins
    plugins: [],
})

app.use(middleware)
app.listen(8080, () => console.log('Serer is up'))
```

## Limitations

-   GraphQL subscriptions are not yet supported

## Development

Install dependencies

```shell
npm i
```

Start the server

```shell
npm run dev
```
