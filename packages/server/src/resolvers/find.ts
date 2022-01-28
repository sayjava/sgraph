import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'

import { normalizeTypeName } from '../utils'
import { createProjection } from './utils'

interface Arg {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
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
