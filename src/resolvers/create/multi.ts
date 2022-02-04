import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Op, Sequelize } from 'sequelize'
import { normalizeTypeName } from '../../utils'
import { associationsToInclude, createProjection } from '../utils'

export default (tc: ObjectTypeComposer, sequelize: Sequelize) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]

    tc.schemaComposer.Mutation.setField(
        `create_${pluralize(typeName.toLocaleLowerCase())}`,
        {
            type: tc.List.NonNull,
            args: {
                inputs: {
                    type: `[${typeName}Input!]!`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                try {
                    const modelArgs = args.inputs as any[]
                    const newModels = await model.bulkCreate(modelArgs, {
                        include: associationsToInclude(model, modelArgs),
                        validate: true,
                    })

                    const pkName =
                        model.primaryKeyAttribute ||
                        model.primaryKeyAttributes[0]

                    const pks = newModels.map((m) => m.getDataValue(pkName))
                    const tree = parseResolveInfo(info)
                    tree.args.where = { [pkName]: { in: pks } }
                    const projection = createProjection(tree, sequelize)

                    const result = await model.findAll(projection)
                    return result.map((row) => row.toJSON())
                } catch (error: any) {
                    if (error.errors) {
                        const messages = error.errors
                            .map((e) => e.message)
                            .join('\n')
                        throw new Error(messages)
                    }

                    throw error
                }
            },
        }
    )
}
