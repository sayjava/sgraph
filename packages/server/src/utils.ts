import { ObjectTypeComposer, SchemaComposer, graphql } from 'graphql-compose'
import { Op } from 'sequelize'

export const normalizeTypeName = (typeName: string): string => {
    return typeName.replace(/\[|\]|\!/g, '')
}

export const getModelTypes = (composer: SchemaComposer) => {
    const types = {}

    Array.from(composer.types.values()).forEach((t) => {
        if (!composer.isObjectType(t)) {
            return false
        }

        const obj = t as ObjectTypeComposer<any, any>
        if (obj.getDirectiveByName('model')) {
            types[t.getTypeName()] = t
        }
    })

    return Object.values(types) as ObjectTypeComposer<any, any>[]
}

const mappedSequelizeFields = () => {
    const OpFields = {}
    Object.values(Op).forEach((op) => (OpFields[op.description] = op))
    return OpFields
}

export const argsToSequelizeWhere = (where: any = {}) => {
    const sequelizeOpFields = mappedSequelizeFields()
    const newWhere = {}
    Object.keys(where).forEach((attrKey) => {
        let ops = {}
        const value = where[attrKey]

        if (sequelizeOpFields[attrKey]) {
            newWhere[sequelizeOpFields[attrKey]] =
                value.map(argsToSequelizeWhere)
        } else {
            Object.keys(value).forEach((opKey) => {
                ops[sequelizeOpFields[opKey]] = value[opKey]
            })
            newWhere[attrKey] = ops
        }
    })
    return newWhere
}
