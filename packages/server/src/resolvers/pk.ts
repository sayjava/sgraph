import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'

import {
    argsToSequelizeWhere,
    getModelTypes,
    normalizeTypeName,
} from '../utils'
import { aggregateFieldsToFn } from './aggregate'
import { attributesFromTree, childrenFromTree } from './utils'

const createProjection = (tree, sequelize) => {
    const { args, fieldsByTypeName, name } = tree
    const [type] = Object.values(fieldsByTypeName)
    const [typeName] = Object.keys(fieldsByTypeName)
    const attributes = attributesFromTree(type)

    const topTree = name.includes('ByPk')
    const extras = {}

    const isAggregate = name.includes('Aggregate')
    if (isAggregate) {
        const [aggrType] = typeName.split('Aggregate')
        return {
            model: sequelize.models[aggrType],
            as: name,
            where: argsToSequelizeWhere(args.where || {}),
            attributes: aggregateFieldsToFn(tree, sequelize),
        }
    }

    if (!topTree) {
        Object.assign(extras, {
            model: sequelize.models[normalizeTypeName(typeName)],
            as: name,
            where: argsToSequelizeWhere(args.where || {}),
        })
    }

    return {
        ...extras,
        attributes,
        include: childrenFromTree(type).map((t) =>
            createProjection(t, sequelize)
        ),
    }
}

const createTypePKResolver = (t: ObjectTypeComposer, sequelize: Sequelize) => {
    const typeName = normalizeTypeName(t.getTypeName())
    const model = sequelize.models[typeName]
    return {
        type: t.NonNull,
        args: {
            id: 'ID!',
        },
        resolve: async (source, args, context, info) => {
            const resolveTree = parseResolveInfo(info)
            const projection = createProjection(resolveTree, sequelize)

            const result = await model.findByPk(args.id, projection)
            if (result) {
                return result.toJSON()
            }

            throw new Error(`No ${typeName} found with id ${args.id}`)
        },
    }
}

export const createPKResolver = ({ composer, sequelize }) => {
    const types = getModelTypes(composer)
    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        composer.Query.setField(
            `${typeName.toLocaleLowerCase()}ByPk`,
            createTypePKResolver(t, sequelize)
        )
    })
}
