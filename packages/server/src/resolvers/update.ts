import { ObjectTypeComposer } from 'graphql-compose'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { Op, Sequelize } from 'sequelize'
import { argsToSequelizeWhere, normalizeTypeName } from '../utils'
import { createProjection, createTypeListResolver } from './list'

const newWhereFromValues = (values: any) => {
    const newWhere = {}
    Object.keys(values).forEach((key) => {
        newWhere[key] = {
            [Op.eq]: values[key],
        }
    })

    return newWhere
}

export const createUpdateResolver = ({
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
        const updateInput = tc.schemaComposer
            .getITC(`${typeName}Input`)
            .clone(`Update${typeName}`)

        // TODO: accommodate for multiple primary keys
        updateInput.removeField(model.primaryKeyAttribute)
        Object.keys(model.rawAttributes).forEach((attr) => {
            updateInput.makeFieldNullable(attr)
        })
        Object.keys(model.associations).forEach((attr) => {
            updateInput.removeField(attr)
        })

        tc.schemaComposer.Mutation.setField(`update${typeName}`, {
            type: tc.NonNull.List,
            args: {
                [singleType]: updateInput,
                where: {
                    type: `${typeName}Filter!`,
                },
            },
            resolve: async (src, args, ctx, info) => {
                const values = args[singleType]
                const where = argsToSequelizeWhere(args.where)

                const [affected] = await model.update(values, {
                    where,
                })

                if (affected > 0) {
                    const newWhere = newWhereFromValues(values)
                    const projection = createProjection(
                        parseResolveInfo(info),
                        sequelize
                    )
                    projection.where = newWhere
                    const records = await model.findAll(projection)
                    return records.map((r) => r.toJSON())
                }

                return []
            },
        })
    })
}
