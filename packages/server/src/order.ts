import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { normalizeTypeName } from './utils'

interface Arg {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}

const createTypeOrderBy = (tc: ObjectTypeComposer) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const orderInput = tc.schemaComposer.createInputTC({
        name: `${typeName}OrderBy`,
        fields: {},
    })

    tc.getFieldNames().forEach((fieldName) => {
        const field = tc.getField(fieldName)
        const fieldType = field.type.getTypeName()
        if (tc.schemaComposer.isScalarType(normalizeTypeName(fieldType))) {
            orderInput.setField(fieldName, {
                type: `OrderBy`,
            })

            // TODO: Aggregate order by
            // if (isNumberField(field)) {
            //     ;['max', 'min'].forEach((agr) => {
            //         orderInput.setField(`${agr}_${fieldName}`, {
            //             type: `OrderBy`,
            //         })
            //     })
            // }
        }
    })
}

export const createOder = ({ types }: Arg) => {
    const [firstType] = types
    firstType.schemaComposer.createEnumTC({
        name: 'OrderBy',
        description: 'Order By',
        values: {
            ASC: {
                value: 'ASC',
                description: 'Ascending',
            },
            DESC: {
                value: 'DESC',
                description: 'Descending',
            },
        },
    })

    types.forEach(createTypeOrderBy)
}
