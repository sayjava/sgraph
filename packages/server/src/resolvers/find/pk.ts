import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'
import { singularize } from 'sequelize/dist/lib/utils'
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
    const pkName = model.primaryKeyAttribute

    tc.schemaComposer.Query.setField(
        `find_${singularize(typeName.toLocaleLowerCase())}_by_pk`,
        {
            type: tc.NonNull,
            args: {
                id: 'ID!',
            },
            resolve: async (source, args, context, info) => {
                const resolveTree = parseResolveInfo(info)
                const projection = createProjection(resolveTree, sequelize)
                const { id }: any = args

                const result = await model.findByPk(id, projection)
                if (result) {
                    return result.toJSON()
                }

                throw new Error(`No ${typeName} found with ${pkName} ${id}`)
            },
        }
    )
}
