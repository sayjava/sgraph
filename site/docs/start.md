---
title: Start
---

## Quick Start

```shell
npx @sayjava/sgraph --schema schema.graphql --database
```

```shell
docker run @sayjava/sgraph
```

## Configuration

Create a `.sgraphrc` json file to hold all possible

An example configuration

| name    | description                       | default        |
| ------- | --------------------------------- | -------------- |
| port    | server port number                | 8080           |
| schema  | Path to the schema definition     | schema.graphql |
| ui      | Enables the altair graphql client | true           |
| cors    | Enables CORS                      | true           |
| path    | The path the API should leave on  | /graphql       |
| tracing | Enables Apollo Tracing            | false          |
| log     | Enables sequelize logs            | false          |

```json
{}
```

## Middleware

```js
import express from 'express'
import { useTiming } from '@envelop/core'
import { createHTTPGraphql } from './server'

const server = express()
const { handler } = createHTTPGraphql({
    schema: 'schema.graphql',
    database: 'database:connection',
})

server.use(bodyParser.json())
server.post('/graphql', handler)

server.listen(config.port, () =>
    console.log(`Server started on ${config.port}`)
)
```

## Serverless

### Firebase

```js
const functions = require('firebase-functions')
const { createServer } = require('@sayjava/sgraph')

const middleware = createServer({
    database: 'databse:connection',
    schema: 'path-to-schema',
    plugins: [],
})

exports.graphql = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    middleware(req, res)
})
```

### AWS Lambda
