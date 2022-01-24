import { SchemaComposer, ObjectTypeComposer, Directive } from 'graphql-compose'
import { ModelAttributes, Sequelize } from 'sequelize'
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
            const isPrimaryKey = !!field.directives.find(
                (d) => d.name === 'primaryKey'
            )

            const isUnique = !!directives.find((d) => d.name === 'unique')
            const nonNull = field.astNode.type.kind === 'NonNullType'
            const columnName = directives.find((d) => d.name === 'column') || {
                args: { name: key },
            }

            attributes[key] = {
                type: typeName,
                unique: isUnique,
                primaryKey: isPrimaryKey,
                allowNull: !nonNull,
                field: columnName.args.name,
                validate: createValidations(directives || []),
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

            tc.addResolver({
                name: `find${typeName}`,
            })

            if (modelDirective) {
                const attributes = typeToAttributes(tc, composer)
                const tableName = modelDirective.tableName || typeName

                if (!hasUniqueField(attributes)) {
                    throw Error(`${typeName} has no unique fields`)
                }

                sequelize.define(tc.getTypeName(), attributes, {
                    tableName,
                    timestamps: false,
                })
            }
        }
    })
}
