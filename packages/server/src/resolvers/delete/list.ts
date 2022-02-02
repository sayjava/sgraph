import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { normalizeTypeName } from '../../utils'
import { argsToSequelizeWhere } from '../utils'

export default ({
    tc,
    sequelize,
}: {
    tc: ObjectTypeComposer
    sequelize: Sequelize
}) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]

    tc.schemaComposer.Mutation.setField(
        `delete_${pluralize(typeName.toLocaleLowerCase())}`,
        {
            type: 'DeleteResponse',
            args: {
                limit: {
                    type: 'Int',
                },
                where: {
                    type: `${typeName}Filter!`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                const where = argsToSequelizeWhere(args.where)
                const limitArg = args.limit ? { limit: args.limit } : {}
                // @ts-ignore
                const affected = await model.destroy({ where, ...limitArg })
                return { affected }
            },
        }
    )
}
