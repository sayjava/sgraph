import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { Sequelize, DataTypes } from 'sequelize'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { argsToSequelizeWhere, normalizeTypeName } from '../utils'

export const createAggregates = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer<any, any>[]
    sequelize: Sequelize
}) => {
    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        const model = sequelize.models[typeName]
        const aggrType = t.schemaComposer.createObjectTC({
            name: `${typeName}Aggregate`,
            fields: {
                count: {
                    type: 'Int!',
                },
            },
        })

        const numbers = ['Float', 'Int']
        Object.entries(model.getAttributes()).forEach(([fieldName, field]) => {
            if (numbers.includes(field.type.toString({}))) {
                ;['min', 'max', 'avg', 'sum', 'total'].forEach((fn) => {
                    aggrType.setField(`${fn}_${fieldName}`, {
                        type: 'Float!',
                    })
                })
            }
        })

        const fieldToInclude = (tree) => {
            const [aggregateModel] = Object.values(tree.fieldsByTypeName)
            return Object.keys(aggregateModel).map((field) => {
                const [fn, fieldName] = field.split('_')
                if (fieldName) {
                    return [
                        sequelize.fn(
                            fn.toUpperCase(),
                            sequelize.col(fieldName)
                        ),
                        field,
                    ]
                }
                return [sequelize.fn(fn.toUpperCase()), fn]
            })
        }

        t.schemaComposer.Query.setField(
            `${pluralize(typeName.toLocaleLowerCase())}Aggregate`,
            {
                type: aggrType,
                args: {
                    where: {
                        type: `${typeName}Filter`,
                    },
                },
                resolve: async (src, args, ctx, info) => {
                    const tree = parseResolveInfo(info)
                    const where = argsToSequelizeWhere(args.where)
                    const include = fieldToInclude(tree)
                    const result = await model.findOne({
                        where,
                        // @ts-ignore
                        attributes: include,
                    })

                    if (result) {
                        return result.toJSON()
                    }

                    return {}
                },
            }
        )
    })
}
