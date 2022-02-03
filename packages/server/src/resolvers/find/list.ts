import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'
import { normalizeTypeName } from '../../utils'
import { createProjection } from '../utils'

const createFindProjection = (tree, sequelize) => {
    const { name, args, fieldsByTypeName } = tree
    const [Response]: any[] = Object.values(fieldsByTypeName)
    const { records } = Response

    const mappedTree = {
        name,
        args,
        fieldsByTypeName: records.fieldsByTypeName,
    }
    return createProjection(mappedTree, sequelize)
}

export const createTypeListResolver = (
    t: ObjectTypeComposer,
    sequelize: Sequelize
) => {
    const typeName = normalizeTypeName(t.getTypeName())
    const model = sequelize.models[typeName]
    return {
        name: `find${pluralize(typeName)}`,
        type: t.schemaComposer.createObjectTC({
            name: `${typeName}FindResponse`,
            fields: {
                count: 'Int!',
                records: t.NonNull.List.NonNull,
            },
        }),
        args: {
            limit: 'Int',
            offset: 'Int',
            order_by: t.schemaComposer.getITC(`${typeName}OrderBy`),
            where: t.schemaComposer.getITC(`${typeName}Filter`),
        },
        resolve: async (source, args, context, info) => {
            // @ts-ignore
            const resolveTree = parseResolveInfo(info)
            const projection = createFindProjection(resolveTree, sequelize)
            const { rows, count } = await model.findAndCountAll(projection)
            const records = rows.map((r) => r.toJSON())
            return { records, count }
        },
    }
}

export default ({
    tc,
    sequelize,
}: {
    tc: ObjectTypeComposer
    sequelize: Sequelize
}) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    tc.schemaComposer.Query.setField(
        `find_${pluralize(typeName.toLocaleLowerCase())}`,
        createTypeListResolver(tc, sequelize)
    )
}