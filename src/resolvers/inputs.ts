import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { normalizeTypeName } from '../utils'

export const createInputs = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    types.forEach((tc) => {
        const typeName = normalizeTypeName(tc.getTypeName())
        const model = sequelize.models[typeName]
        const input = tc.getITC()

        input.getFieldNames().forEach((field) => {
            const association = model.associations[field]
            if (association) {
                const associationType =
                    association.associationType.toLowerCase()
                /**
                 * Remove this field from the input for belongsTo relationships
                 */
                if (associationType.includes('belongs')) {
                    input.removeField(field)
                    input.makeFieldNullable(association.foreignKey)
                }

                /**
                 * For relationships of hasMany and hasOne
                 * This field can be nullable
                 *
                 */
                if (associationType.includes('has')) {
                    // TODO: account for relationships that are mandatory
                    input.makeFieldNullable(field)
                }
            }
        })
    })
}
