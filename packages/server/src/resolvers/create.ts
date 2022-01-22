import { ObjectTypeComposer } from 'graphql-compose'
import { Model, ModelCtor, Sequelize } from 'sequelize/dist'
import { normalizeTypeName } from '../utils'

const associationsToInclude = (model: ModelCtor<Model>, tree: any) => {
    return Object.keys(tree)
        .filter((attr) => model.associations[attr])
        .map((attr) => {
            const assoc = model.associations[attr]
            return {
                as: assoc.as,
                model: assoc.target,
                includes: associationsToInclude(assoc.target, tree[attr]),
            }
        })
}

export const createCreateResolver = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    types.forEach((tc) => {
        const typeName = normalizeTypeName(tc.getTypeName())
        const model = sequelize.models[typeName]
        const input = tc.getITC()

        input.getFieldNames().forEach((field) => {
            const association = model.associations[field]
            if (association) {
                if (
                    association.associationType
                        .toLowerCase()
                        .includes('belongs')
                ) {
                    input.removeField(field)
                    input.makeFieldNullable(association.foreignKey)
                }

                if (association.associationType.toLowerCase().includes('has')) {
                    input.makeFieldNullable(field)
                }
            }
        })

        tc.schemaComposer.Mutation.setField(`create${typeName}`, {
            type: tc,
            args: {
                [typeName.toLocaleLowerCase()]: input,
            },
            resolve: async (src, args, ctx, info) => {
                const modelArgs = args[typeName.toLocaleLowerCase()]

                const newModel = await model.create(modelArgs, {
                    include: associationsToInclude(model, modelArgs),
                })
                return newModel.toJSON()
            },
        })
    })
}
