const fs = require('fs')
module.exports = async () => {
    return new Promise((resolve) => {
        fs.unlinkSync('jest/database.sqlite')
        fs.unlinkSync('jest/schema.graphql')
        resolve()
    })
};