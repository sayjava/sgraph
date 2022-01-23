import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { ModelCtor, Sequelize } from 'sequelize'

import {
    argsToSequelizeOrder,
    argsToSequelizeWhere,
    normalizeTypeName,
} from '../utils'
import { extractAttributesFromTree, extractChildrenFromTree } from './utils'

interface Arg {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}

const DEFAULT_LIMIT = 10

export const createProjection = (tree: any, sequelize: Sequelize) => {
    const { args, fieldsByTypeName, name } = tree
    const [type] = Object.values(fieldsByTypeName)
    const [typeName] = Object.keys(fieldsByTypeName)
    const model = sequelize.models[typeName]
    const topOfTree = name.match(/find*|update*/)

    const { limit = DEFAULT_LIMIT, offset = 0 } = args
    const projection = {
        limit,
        offset,
        where: argsToSequelizeWhere(args.where || {}),
        order: argsToSequelizeOrder({
            order: args.order || {},
            sequelize,
            modelName: typeName,
        }),
        attributes: extractAttributesFromTree(type, model),
        include: extractChildrenFromTree(type, model).map((tree) =>
            createProjection(tree, sequelize)
        ),
    }

    if (!topOfTree) {
        return {
            as: name,
            model: sequelize.models[typeName],
            ...projection,
        }
    }

    return projection
}

export const createTypeListResolver = (
    t: ObjectTypeComposer,
    sequelize: Sequelize
) => {
    const typeName = normalizeTypeName(t.getTypeName())
    const model = sequelize.models[typeName]
    return {
        name: `find${pluralize(typeName)}`,
        type: t.List.NonNull,
        args: {
            limit: 'Int',
            offset: 'Int',
            order: t.schemaComposer.getITC(`${typeName}OrderBy`),
            where: t.schemaComposer.getITC(`${typeName}Filter`),
        },
        resolve: async (source, args, context, info) => {
            // @ts-ignore
            const resolveTree = parseResolveInfo(info)
            const projection = createProjection(resolveTree, sequelize)
            const result = await model.findAndCountAll(projection)

            const items = result.rows.map((r) => r.toJSON())
            return items
        },
    }
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

export const createListResolver = ({ types, sequelize }: Arg) => {
    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        t.schemaComposer.Query.setField(
            `find${pluralize(typeName)}`,
            createTypeListResolver(t, sequelize)
        )
    })
}
