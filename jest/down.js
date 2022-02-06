const fs = require('fs')
module.exports = async () => {
    return new Promise((resolve) => {
        fs.unlink('northwind/database.sqlite', resolve)
    })
};