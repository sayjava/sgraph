---
title: Start
sidebar_position: 1
---

## Standalone Server

The `sGraph` server ships with good features to get up and running with a simple graphql server. It is quite straight forward to spin up a server

**NodeJS**

```shell
npx @sayjava/sgraph --schema schema.graphql --database sqlite::memory:
```

**Docker**

```shell
docker run -v $(pwd):/app @sayjava/sgraph --schema /app/schema.graphql --database sqlite::memory:
```

## Server Configuration

All supported configurations options can also be passed on as command line flags e.g `--schema new.graphql --port 9090`

Supported configuration file formats are:

-   `sgraphrc`
-   `sgraphrc.json`

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

    // Enable logging (SQL and Resolver)
    "log": false
}
```

## Supported Databases

`sGraph` supports all the same databases that are supported by `Sequelize ORM`

### SQLite

### MySQL

### PostgreSQL

### OracleDB

## sGraph Middleware

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

## Serverless

`sGraph` at its heart is a connect middleware, therefore it can be used in serverless environments as well. This can be very useful for simple projects or in-house tools

### Firebase

```js
const functions = require('firebase-functions')
const { createServer } = require('@sayjava/sgraph')

const middleware = createServer({
    database: 'databse:connection',
    schema: 'path-to-schema',
    cors: true
    plugins: [],
})

exports.graphql = functions.https.onRequest((req, res) => {
    // Enable CORS requests
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    middleware(req, res)
})
```

### AWS Lambda

**Coming Soon**
