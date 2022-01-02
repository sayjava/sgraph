import { SchemaComposer, ObjectTypeComposer } from 'graphql-compose'
import { ModelAttributes, Sequelize } from 'sequelize'
import { normalizeTypeName } from './utils'

interface Arg {
    composer: SchemaComposer
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

            const nonNull = field.astNode.type.kind === 'NonNullType'
            attributes[key] = {
                type: typeName,
                primaryKey: isPrimaryKey,
                allowNull: isPrimaryKey || !nonNull,
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

export const mapTypesToModel = ({ composer, sequelize }: Arg) => {
    composer.types.forEach((t) => {
        if (composer.isObjectType(t)) {
            const obj = t as ObjectTypeComposer<any, any>
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
