import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'
import { singularize } from 'sequelize/dist/lib/utils'
import { normalizeTypeName } from '../../utils'
import { associationsToInclude, createProjection } from '../utils'

export default (tc: ObjectTypeComposer, sequelize: Sequelize) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]

    tc.schemaComposer.Mutation.setField(
        `create_${singularize(typeName.toLocaleLowerCase())}`,
        {
            type: tc,
            args: {
                input: {
                    type: `${typeName}Input`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                const modelArgs = args.input

                const newModel = await model.create(modelArgs, {
                    include: associationsToInclude(model, modelArgs),
                })

                const pkName =
                    model.primaryKeyAttribute || model.primaryKeyAttributes[0]
                const pkValue = newModel.getDataValue(pkName)

                const tree = parseResolveInfo(info)
                const projection = createProjection(tree, sequelize)
                const result = await model.findByPk(pkValue, projection)

                return result.toJSON()
            },
        }
    )
}
