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

const getDBType = (typeName: string) => {
    const types = {
        ID: {
            type: DataTypes.STRING,
            validate: {},
        },
        Int: {
            type: DataTypes.INTEGER,
            validate: {},
        },
        Float: {
            type: DataTypes.FLOAT,
            validate: {},
        },
        UUID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            validate: { isUUID: 4 },
        },
        Date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
            validate: { isDate: true },
        },
        DateTime: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            validate: { isDate: true },
        },
        Email: {
            type: DataTypes.STRING,
            validate: { isEmail: true },
        },
        URL: {
            type: DataTypes.STRING,
            validate: { isUrl: true },
        },
        CreditCard: {
            type: DataTypes.STRING,
            validate: { isCreditCard: true },
        },
        IPv4: {
            type: DataTypes.STRING,
            validate: { isIPv4: true },
        },
        IPv6: {
            type: DataTypes.STRING,
            validate: { isIPv6: true },
        },
        String: {
            type: DataTypes.STRING,
            validate: {},
        },
        JSON: {
            type: DataTypes.JSON,
            validate: {},
        },
    }

    return (
        types[typeName] || {
            type: DataTypes.STRING,
            validate: {},
        }
    )
}

const typeToAttributes = (
    obj: ObjectTypeComposer,
    composer: SchemaComposer
) => {
    const attributes = {}
    const fields = obj.getFields()

    Object.entries(fields).forEach(([fieldName, config]) => {
        const typeName = normalizeTypeName(config.type.getTypeName())
        const field = fields[fieldName]
        const directives = field.directives || []

        if (composer.isScalarType(typeName)) {
            const primaryKey = !!field.directives.find(
                (d) => d.name === 'primaryKey'
            )

            const defaultColumn = { args: { name: fieldName } }
            const unique = !!directives.find((d) => d.name === 'unique')
            const allowNull = field.astNode.type.kind !== 'NonNullType'
            const column = directives.find((d) => d.name === 'column')

            const autoIncrement = !!directives.find(
                (d) => d.name === 'autoIncrement'
            )

            const dbType = getDBType(typeName)
            const directiveValidation = createValidations(directives)
            dbType.validate = Object.assign(
                dbType.validate,
                directiveValidation
            )

            attributes[fieldName] = {
                ...dbType,
                unique,
                primaryKey,
                allowNull,
                autoIncrement,
                field: (column || defaultColumn).args.name,
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
    })
}
