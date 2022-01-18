import { SchemaComposer, ObjectTypeComposer } from 'graphql-compose'
import { ModelAttributes, Sequelize } from 'sequelize'
import { normalizeTypeName } from './utils'

interface Arg {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
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

        if (composer.isScalarType(typeName)) {
            const isPrimaryKey = !!field.directives.find(
                (d) => d.name === 'primaryKey'
            )

            const isUnique = !!field.directives.find((d) => d.name === 'unique')
            const nonNull = field.astNode.type.kind === 'NonNullType'
            const columnName = field.directives.find(
                (d) => d.name === 'column'
            ) || { args: { name: key } }

            attributes[key] = {
                type: typeName,
                unique: isUnique,
                primaryKey: isPrimaryKey,
                allowNull: isPrimaryKey || !nonNull,
                field: columnName.args.name,
            }

            isUnique && console.log(attributes)
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
            const obj = tc as ObjectTypeComposer<any, any>
            const typeName = obj.getTypeName()
            const modelDirective = obj.getDirectiveByName('model')

            if (modelDirective) {
                const attributes = typeToAttributes(obj, composer)
                const tableName = modelDirective.tableName || typeName

                if (!hasUniqueField(attributes)) {
                    throw Error(`${typeName} has no unique fields`)
                }

                sequelize.define(obj.getTypeName(), attributes, {
                    tableName,
                    timestamps: false,
                })
            }
        }
    })
}
