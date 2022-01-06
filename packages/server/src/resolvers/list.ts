import { SchemaComposer, ObjectTypeComposer, pluralize } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'

import {
    argsToSequelizeWhere,
    getModelTypes,
    normalizeTypeName,
} from '../utils'

interface Arg {
    composer: SchemaComposer
    sequelize: Sequelize
}

const extractAttributes = (attrs: any) => {
    return Object.keys(attrs).filter((attrKey) => {
        const children = attrs[attrKey].fieldsByTypeName
        return Object.keys(children).length === 0
    })
}

const extractChildren = (attrs: any) => {
    return Object.keys(attrs)
        .filter((attrKey) => {
            const children = attrs[attrKey].fieldsByTypeName
            return Object.keys(children).length > 0
        })
        .map((key) => attrs[key])
}

const DEFAULT_LIMIT = 10

const createProjection = (tree: any, sequelize: Sequelize) => {
    const { args, fieldsByTypeName, name } = tree
    const [type] = Object.values(fieldsByTypeName)
    const [typeName] = Object.keys(fieldsByTypeName)
    const topOfTree = name.includes('find')

    const { limit = DEFAULT_LIMIT, offset = 0 } = args

    const projection = {
        limit,
        offset,
        where: argsToSequelizeWhere(args),
        attributes: extractAttributes(type),
        include: extractChildren(type).map((tree) =>
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
        // type: t.schemaComposer.getOrCreateOTC(`${typeName}Response`, (tc) => {
        //     tc.addFields({
        //         items: {
        //             type: t.List.NonNull,
        //         },
        //         count: {
        //             type: 'Int',
        //         },
        //     })
        // }),
        type: t.List.NonNull,
        args: {
            limit: 'Int',
            offset: 'Int',
            where: t.schemaComposer.getITC(`${typeName}Filter`),
        },
        resolve: async (source, args, context, info) => {
            // @ts-ignore
            const resolveTree = parseResolveInfo(info)
            const projection = createProjection(resolveTree, sequelize)
            const result = await model.findAndCountAll(projection)

            const items = result.rows.map((r) => r.toJSON())
            return items
            // return { items, count: result.count }
        },
    }
}

export const createListResolver = ({ composer, sequelize }: Arg) => {
    const types = getModelTypes(composer)
    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        composer.Query.setField(
            `find${pluralize(typeName)}`,
            createTypeListResolver(t, sequelize)
        )
    })
}
