import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Op, Sequelize } from 'sequelize'
import { normalizeTypeName } from '../../utils'
import { createProjection } from '../utils'

export default ({
    tc,
    sequelize,
}: {
    tc: ObjectTypeComposer
    sequelize: Sequelize
}) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]
    const pk = model.primaryKeyAttribute || model.primaryKeyAttributes[0]

    tc.schemaComposer.Mutation.setField(
        `update_${typeName.toLocaleLowerCase()}_by_pk`,
        {
            type: tc.NonNull,
            args: {
                input: `Update${typeName}Input`,
                id: 'ID!',
            },
            resolve: async (src, args, ctx, info) => {
                const { input, id } = args
                const where = { [pk]: { [Op.eq]: id } }

                const [affected] = await model.update(input, { where })

                if (affected === 0) {
                    throw Error(
                        `No updates done for ${typeName} with primary key ${id}`
                    )
                }

                const tree = parseResolveInfo(info)
                const projection = createProjection(tree, sequelize)
                const record = await model.findByPk(id as any, projection)
                return record.toJSON()
            },
        }
    )
}
