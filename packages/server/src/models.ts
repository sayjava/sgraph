import { SchemaComposer, ObjectTypeComposer, Directive } from 'graphql-compose'
import { DataTypes, ModelAttributes, Sequelize } from 'sequelize'
import { normalizeTypeName } from './utils'

interface Arg {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}

const createValidations = (directives: Directive[]) => {
    const validate = {}
    directives
        .filter((d) => d.name.includes('validate_'))
        .forEach((d) => {
            const [validation] = d.name.split('validate_').reverse()
            validate[validation] = d.args.value || true
        })

    return validate
}

const DBTypes = {
    uuidv1: {
        type: DataTypes.UUIDV1,
        defaultValue: DataTypes.UUIDV1,
    },
    uuidv4: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
    },
    dateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
}

const getDBType = ({
    directives,
    typeName,
}: {
    directives: Directive[]
    typeName: string
}) => {
    const typeDirective = directives.find((d) => !!DBTypes[d.name])

    if (typeDirective) {
        return DBTypes[typeDirective.name]
    }

    return { type: typeName }
}

const typeToAttributes = (
    obj: ObjectTypeComposer,
    composer: SchemaComposer
) => {
    const attributes = {}
    const fields = obj.getFields()

    Object.entries(fields).forEach(([key, config]) => {
        const typeName = normalizeTypeName(config.type.getTypeName())
        const field = fields[key]
        const directives = field.directives || []

        if (composer.isScalarType(typeName)) {
            const primaryKey = !!field.directives.find(
                (d) => d.name === 'primaryKey'
            )

            const defaultCol = { args: { name: key } }
            const unique = !!directives.find((d) => d.name === 'unique')
            const allowNull = field.astNode.type.kind !== 'NonNullType'
            const column = directives.find((d) => d.name === 'column')
            const validate = createValidations(directives || [])

            const autoIncrement = !!directives.find(
                (d) => d.name === 'autoIncrement'
            )

            const type = getDBType({ directives, typeName })
            attributes[key] = {
                ...type,
                unique,
                primaryKey,
                allowNull,
                autoIncrement,
                validate,
                field: (column || defaultCol).args.name,
            }
        }
    })

    return attributes
}

const hasUniqueField = (attrs: { [key: string]: ModelAttributes }) => {
    return !!Object.values(attrs).find((attr) => {
        return attr.primaryKey
    })
}

export const createTypeModels = ({ types, sequelize }: Arg) => {
    types.forEach((tc) => {
        const composer = tc.schemaComposer
        if (composer.isObjectType(tc)) {
            const typeName = tc.getTypeName()
            const modelDirective = tc.getDirectiveByName('model')
            const timestamps = !!tc.getDirectiveByName('autoTimestamp')

            if (modelDirective) {
                const attributes = typeToAttributes(tc, composer)
                const tableName = modelDirective.tableName || typeName

                if (!hasUniqueField(attributes)) {
                    throw Error(`${typeName} has no primary key field`)
                }

                if (timestamps) {
                    tc.setField('createdAt', { type: 'String' })
                    tc.setField('updatedAt', { type: 'String' })
                }

                sequelize.define(tc.getTypeName(), attributes, {
                    tableName,
                    timestamps,
                })
            }
        }
    })
}
