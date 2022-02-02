import { ObjectTypeComposer } from 'graphql-compose'
import { Op, Sequelize } from 'sequelize'
import { normalizeTypeName } from '../../utils'

export default ({
    tc,
    sequelize,
}: {
    tc: ObjectTypeComposer
    sequelize: Sequelize
}) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]
    const pkName = model.primaryKeyAttribute || model.primaryKeyAttributes[0]

    tc.schemaComposer.Mutation.setField(
        `delete_${typeName.toLocaleLowerCase()}_by_pk`,
        {
            type: 'DeleteResponse!',
            args: {
                id: 'ID!',
            },
            resolve: async (source, args, context, info) => {
                const { id }: any = args
                const affected = await model.destroy({
                    where: { [pkName]: { [Op.eq]: id } },
                })
                return { affected }
            },
        }
    )
}
