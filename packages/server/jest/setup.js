const fs = require('fs')
module.exports = async (global) => {
    const dbPath = 'test/fixtures/northwind.sqlite'
    fs.copyFileSync('test/fixtures/northwind.original.sqlite', dbPath)
};