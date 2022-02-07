const functions = require("firebase-functions");
const { createServer } = require("@sayjava/sgraph")

const middleware = createServer({
    database: 'sqlite:northwind.sqlite',
    schema: './schema.graphql',
    plugins: []
})

exports.graphql = functions.https.onRequest((req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    middleware(req, res)
});
