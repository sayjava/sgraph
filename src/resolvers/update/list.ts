import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize/dist'
import { normalizeTypeName } from '../../utils'
import { argsToSequelizeWhere, createProjection } from '../utils'
import { newWhereFromValues } from './utils'

export default ({
    tc,
    sequelize,
}: {
    tc: ObjectTypeComposer
    sequelize: Sequelize
}) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]

    const responseTc = tc.schemaComposer.createObjectTC({
        name: `${pluralize(typeName)}UpdateResponse`,
        fields: {
            affected: 'Int!',
            records: {
                type: tc.NonNull.List,
                resolve: async (src, args, ctx, info) => {
                    const { where } = src
                    const tree = parseResolveInfo(info)
                    const projection = createProjection(tree, sequelize)
                    const newProjection = Object.assign(projection, { where })
                    const records = await model.findAll(newProjection)
                    return records.map((r) => r.toJSON())
                },
            },
        },
    })

    tc.schemaComposer.Mutation.setField(
        `update_${pluralize(typeName.toLocaleLowerCase())}`,
        {
            type: responseTc.NonNull,
            args: {
                data: `Update${typeName}Input`,
                limit: 'Int',
                where: {
                    type: `${typeName}Filter!`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                const values = args.data
                const where = argsToSequelizeWhere(args.where)
                const limit: any = args.limit ? { limit: args.limit } : {}

                const [affected] = await model.update(values, {
                    where,
                    ...limit,
                })

                return {
                    affected,
                    /**
                     * This filter is returned here to be used by
                     * by the upstream resolver for returning records
                     * if required
                     *  */
                    where: newWhereFromValues(values),
                }
            },
        }
    )
}
