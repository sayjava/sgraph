import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import pkResolver from './pk'
import listResolver from './list'

export const createFindResolver = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    types
        .filter((tc) => {
            const crud = tc.getDirectiveByName('crud')
            return crud?.read !== false
        })
        .forEach((tc) => {
            pkResolver({ tc, sequelize })
            listResolver({ tc, sequelize })
        })
}
