import createSingle from './single'
import createMulti from './multi'
import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize/dist'

export const createCreateResolver = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    types.forEach((tc) => {
        createSingle(tc, sequelize)
        createMulti(tc, sequelize)
    })
}
