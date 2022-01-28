import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Sequelize } from 'sequelize'

import { normalizeTypeName } from '../utils'
import { createProjection } from './utils'

const createTypePKResolver = (t: ObjectTypeComposer, sequelize: Sequelize) => {
    const typeName = normalizeTypeName(t.getTypeName())
    const model = sequelize.models[typeName]
    const pkName = model.primaryKeyAttribute
    return {
        type: t.NonNull,
        args: {
            [pkName]: 'ID!',
        },
        resolve: async (source, args, context, info) => {
            const resolveTree = parseResolveInfo(info)
            const projection = createProjection(resolveTree, sequelize)

            const result = await model.findByPk(args[pkName], projection)
            if (result) {
                return result.toJSON()
            }

            throw new Error(
                `No ${typeName} found with ${pkName} ${args[pkName]}`
            )
        },
    }
}

export const createPKResolver = ({ types, sequelize }) => {
    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        t.schemaComposer.Query.setField(
            `${typeName.toLocaleLowerCase()}ByPk`,
            createTypePKResolver(t, sequelize)
        )
    })
}
