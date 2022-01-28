const fs = require('fs')
module.exports = async () => {
    return new Promise((resolve) => {
        fs.unlink('test/fixtures/northwind.sqlite', resolve)
    })
};