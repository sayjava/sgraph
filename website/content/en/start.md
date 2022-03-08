---
title: Quick Start
position: 2
---

The `sGraph` server ships with good features to get up and running with a simple graphql server. It is quite straight forward to spin up a server

```shell
npx @sayjava/sgraph --schema schema.graphql --database sqlite::memory:
```

## Server Configuration

All supported configurations options can also be passed on as command line flags e.g `--schema new.graphql --port 9090`

Supported configuration file formats are:

-   `sgraphrc`
-   `sgraphrc.json`

**Sample Full Configuration**

```json
{
    // Port number to start the server on
    "port": 8080,

    // The path to the schema file containing the graphql definitions
    "schema": "schema.graphql",

    // Enable the included Altair client reachable at /graphql in the browser
    "ui": true,

    // Enable cors request handling
    "cors": true,

    // The path that the API will be served on
    "path": "/graphql",

    // Enable Apollo tracing
    "tracing": false,

    // Depth limit for API calls
    "depthLimit": 3,

    // Enable logging (SQL and Resolver)
    "log": false
}
```

Configurations can be loaded from a different location using:

```shell
npx @sayjava/sgraph --config path/to/another/config
```

## Supported Databases

`sGraph` supports all the same databases that are supported by [Sequelize ORM](https://sequelize.org/)

| Database               | Dependencies   | Bundled | Connection                                                                       |
| ---------------------- | -------------- | ------- | -------------------------------------------------------------------------------- |
| SQLite                 | `sqlite3`      | Yes     | `sqlite:path-to-file.sqlite`                                                     |
| Postgres               | `pg pg-hstore` | Yes     | `postgres://user:pass@example.com:5432/dbname`                                   |
| MySQL                  | `mysql2`       | Yes     | `mysql://user:pass@example.com:3306`                                             |
| MariaDB                | `mariadb`      | No      | `mariadb://user:pass@example.com:3306`                                           |
| Microsoft SQL Server   | `tedious`      | No      | [Check the sequelize docs](https://sequelize.org/v6/manual/getting-started.html) |
| Amazon Redshift        | `ibm_db`       | No      | [Check the sequelize docs](https://sequelize.org/v6/manual/getting-started.html) |
| Snowflake’s Data Cloud | `odbc`         | No      | [Check the sequelize docs](https://sequelize.org/v6/manual/getting-started.html) |

## Programmatic Middleware

Bring your own sever. If you have an existing server or an SSR application, `sGraph` can be used as a middleware without spinning up a new server

```js
import express from 'express'
import { useTiming } from '@envelop/core'
import { createHTTPGraphql } from '@sayjava/sgraph'

const server = express()
const { handler } = createHTTPGraphql({
    schema: 'schema.graphql',
    // sequelize database connection
    database: 'database:connection',
})

server.use(bodyParser.json())
server.post('/graphql', handler)

server.listen(8080, () => console.log(`Server started`))
```
