import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { Sequelize } from 'sequelize/dist'
import { normalizeTypeName } from '../utils'
import { associationsToInclude } from './utils'

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
        const singleType = typeName.toLocaleLowerCase()
        const pluralType = pluralize(singleType)

        tc.schemaComposer.Mutation.setField(`create${typeName}`, {
            type: tc,
            args: {
                [singleType]: {
                    type: `${typeName}Input`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                const modelArgs = args[singleType]
                const newModel = await model.create(modelArgs, {
                    include: associationsToInclude(model, modelArgs),
                })
                return newModel.toJSON()
            },
        })

        tc.schemaComposer.Mutation.setField(`create${pluralize(typeName)}`, {
            type: tc.List.NonNull,
            args: {
                [pluralType]: {
                    type: `[${typeName}Input!]!`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                try {
                    const modelArgs = args[pluralType] as any[]
                    const newModel = await model.bulkCreate(modelArgs, {
                        include: associationsToInclude(model, modelArgs),
                        validate: true,
                    })
                    return newModel.map((m) => m.toJSON())
                } catch (error: any) {
                    const messages = error.errors
                        .map((e) => e.message)
                        .join('\n')
                    throw new Error(messages)
                }
            },
        })
    })
}
