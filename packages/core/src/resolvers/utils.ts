import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { ModelCtor, Model, Sequelize, Op, Association } from 'sequelize'
import { normalizeTypeName } from '../utils'

const DEFAULT_LIMIT = 10

export const extractAttributesFromTree = (tree: any, model: ModelCtor<any>) => {
    const selected = Object.keys(tree).filter(
        (attrKey) => model.rawAttributes[attrKey]
    )

    /**
     * Include associated attributes that is useful for resolvers downstream e.g aggregates
     */
    const associated = Object.keys(model.associations).map((assocKey) => {
        const assoc = model.associations[assocKey]
        /**
         * There is a source key for all associations,
         * it is usually implicitly the primary key of the
         * source model
         */
        // TODO: Fix possible scenarios of multiple primary key attributes
        // @ts-ignore
        return assoc.sourceKey || model.primaryKeyAttribute
    })

    return Array.from(new Set([...selected, ...associated]).values())
}

export const extractChildrenFromTree = (tree: any, model: ModelCtor<any>) => {
    return Object.keys(tree)
        .filter((attrKey) => model.associations[attrKey])
        .map((key) => {
            return {
                tree: tree[key],
                association: model.associations[key],
            }
        })
}

export const associationsToInclude = (model: ModelCtor<Model>, tree: any) => {
    const values = Array.isArray(tree) ? tree[0] : tree
    return Object.keys(values)
        .filter((attr) => model.associations[attr])
        .map((attr) => {
            const assoc = model.associations[attr]
            return {
                as: assoc.as,
                model: assoc.target,
                include: associationsToInclude(assoc.target, values[attr]),
            }
        })
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

interface CreateOrderArg {
    sequelize: Sequelize
    order: any
    modelName: string
}

export const argsToSequelizeOrder = ({
    order = {},
    modelName,
    sequelize,
}: CreateOrderArg) => {
    const model = sequelize.models[modelName]

    return Object.keys(order).map((field) => {
        const orderVal = order[field]
        const [fieldName, fn] = field.split('_').reverse()

        if (model.getAttributes()[fieldName]) {
            if (fn) {
                return [sequelize.fn(fn, sequelize.col(fieldName)), orderVal]
            }
            return [fieldName, orderVal]
        }
    })
}

export const createProjection = (
    tree: any,
    sequelize: Sequelize,
    association: Association = null
) => {
    const { args, fieldsByTypeName, name } = tree
    const [type] = Object.values(fieldsByTypeName)
    const [typeName] = Object.keys(fieldsByTypeName)
    const model = sequelize.models[typeName]

    const { limit = DEFAULT_LIMIT, offset = 0 } = args
    const projection = {
        limit,
        offset,
        where: argsToSequelizeWhere(args.where || {}),
        order: argsToSequelizeOrder({
            order: args.order_by || {},
            sequelize,
            modelName: typeName,
        }),
        attributes: extractAttributesFromTree(type, model),
        include: extractChildrenFromTree(type, model).map(
            ({ tree, association }) =>
                createProjection(tree, sequelize, association)
        ),
    }

    if (association) {
        return {
            as: name,
            model: sequelize.models[typeName],
            separate: association.associationType === 'HasMany',
            ...projection,
        }
    }

    return projection
}

export const createRelationship = (t: ObjectTypeComposer) => {
    const typeName = normalizeTypeName(t.getTypeName())
    return {
        name: `find${pluralize(typeName)}`,
        type: t.List.NonNull,
        args: {
            limit: 'Int',
            offset: 'Int',
            order: t.schemaComposer.getITC(`${typeName}OrderBy`),
            where: t.schemaComposer.getITC(`${typeName}Filter`),
        },
    }
}
