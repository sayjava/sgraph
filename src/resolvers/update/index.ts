import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { normalizeTypeName } from '../../utils'
import pkResolver from './pk'
import listResolver from './list'

export const createUpdateResolver = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    types
        .filter((tc) => {
            const crud = tc.getDirectiveByName('crud')
            return crud?.update !== false
        })
        .forEach((tc) => {
            const typeName = normalizeTypeName(tc.getTypeName())
            const model = sequelize.models[typeName]

            const updateInput = tc.schemaComposer
                .getITC(`${typeName}Input`)
                .clone(`Update${typeName}Input`)
                .removeField(model.primaryKeyAttribute)

            //  make fields optionals
            Object.keys(model.rawAttributes).forEach((attr) => {
                updateInput.makeFieldNullable(attr)
            })

            // Remove all associations
            Object.keys(model.associations).forEach((attr) => {
                updateInput.removeField(attr)
            })

            pkResolver({ tc, sequelize })
            listResolver({ tc, sequelize })
        })
}
