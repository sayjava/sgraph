const fs = require('fs')
module.exports = async () => {
    fs.copyFileSync('northwind/functions/northwind.sqlite', 'jest/database.sqlite')
    fs.copyFileSync('northwind/functions/schema.graphql', 'jest/schema.graphql')
};