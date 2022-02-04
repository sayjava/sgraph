import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import pkResolver from './pk'
import listResolver from './list'

export const createDeleteResolver = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    types
        .filter((tc) => {
            const crud = tc.getDirectiveByName('crud')
            return crud?.delete !== false
        })
        .forEach((tc) => {
            tc.schemaComposer.getOrCreateOTC('DeleteResponse', (rtc) => {
                rtc.setField('affected', { type: 'Int' })
            })

            pkResolver({ tc, sequelize })
            listResolver({ tc, sequelize })
        })
}
