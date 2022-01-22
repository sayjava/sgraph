import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'

import { argsToSequelizeWhere, normalizeTypeName } from '../utils'
import { extractAttributesFromTree, extractChildrenFromTree } from './utils'

const createProjection = (tree, sequelize) => {
    const { args, fieldsByTypeName, name } = tree
    const [type] = Object.values(fieldsByTypeName)
    const [typeName] = Object.keys(fieldsByTypeName)

    const model = sequelize.models[typeName]
    const topTree = name.includes('ByPk')
    const attributes = extractAttributesFromTree(type, model)

    const extras = {}
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
        include: extractChildrenFromTree(type, model).map((t) =>
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

export const createPKResolver = ({ types, sequelize }) => {
    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        t.schemaComposer.Query.setField(
            `${typeName.toLocaleLowerCase()}ByPk`,
            createTypePKResolver(t, sequelize)
        )
    })
}
