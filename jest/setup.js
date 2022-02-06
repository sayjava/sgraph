const fs = require('fs')
module.exports = async () => {
    const dbPath = 'northwind/database.sqlite'
    fs.copyFileSync('northwind/database.original.sqlite', dbPath)
};