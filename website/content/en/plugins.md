---
title: Plugins
category: 'Guide'
position: 5
---

`sGraph` utilizes [Envelope Plugins](https://www.envelop.dev) into its framework. Therefore all envelope plugins from the community can be incorporated into the sGraph server without writing much code.

## Included Plugins

`sGraph` server comes bundled with some plugins from the community

-   [Apollo Tracing](https://www.envelop.dev/plugins/use-apollo-tracing)
-   [Depth Limiting](https://www.envelop.dev/plugins/use-depth-limit)

## Example

It is very straightforward to incorporate plugins into a graphql server. Here is how the depth limit plugin in used in the `sGraph` server.

```javascript
import { createServer } from '@sayjava/sgraph-core'
import { useApolloTracing } from '@envelop/apollo-tracing'

const { server, sequelize } = createServer({
    plugins: [useDepthLimit({ maxDepth: config.depthLimit })],
})
server.listen(8080)
```

## Authentication Example

Here is an example of implementing authentication into a `sGraph` Server

```javascript
import { createServer } from '@sayjava/sgraph-core'
import { useApolloTracing } from '@envelop/apollo-tracing'

const { server, sequelize } = createServer({
    plugins: [useDepthLimit({ maxDepth: config.depthLimit })],
})
server.listen(8080)
```

## Other Plugins

See the [envelop plugin hub](https://www.envelop.dev/plugins) for other use community created plugins

See how to [create envelop plugin](https://www.envelop.dev/docs)
