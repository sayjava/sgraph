const fs = require('fs')
module.exports = async () => {
    console.log(process.cwd())
    fs.copyFileSync('../../examples/northwind/northwind.sqlite', 'jest/database.sqlite')
    fs.copyFileSync('../../examples/northwind/schema.graphql', 'jest/schema.graphql')
};