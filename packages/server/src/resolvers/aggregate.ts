import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { argsToSequelizeWhere, normalizeTypeName } from '../utils'

export const aggregateFieldsToFn = (tree: any, sequelize: Sequelize) => {
    const [aggregateType] = Object.values(tree.fieldsByTypeName)
    return Object.keys(aggregateType).map((field) => {
        const [fn, fieldName] = field.split('_')
        if (fieldName) {
            return [
                sequelize.fn(fn.toUpperCase(), sequelize.col(fieldName)),
                field,
            ]
        }
        return [sequelize.fn(fn.toUpperCase()), fn]
    })
}

const createAggregateResolver = (
    tc: ObjectTypeComposer,
    sequelize: Sequelize
) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]

    return async (source, args, ctx, info) => {
        const tree = parseResolveInfo(info)
        const where = argsToSequelizeWhere(args.where)
        const include = aggregateFieldsToFn(tree, sequelize)

        const result = (await model.findOne({
            where,
            // @ts-ignore
            attributes: include,
        })) || { toJSON: () => ({}) }

        return result.toJSON()
    }
}

export const createAggregates = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer<any, any>[]
    sequelize: Sequelize
}) => {
    const numberTypes = ['Float', 'Int']
    const aggregateTypes = ['min', 'max', 'avg', 'sum', 'total']

    types.forEach((t) => {
        const typeName = normalizeTypeName(t.getTypeName())
        const model = sequelize.models[typeName]

        t.schemaComposer.getOrCreateOTC(
            `${typeName}Aggregate`,
            (aggregateType) => {
                aggregateType.setField('count', { type: 'Int!' })

                Object.entries(model.getAttributes())
                    .filter(([_, field]) => {
                        return numberTypes.includes(field.type.toString({}))
                    })
                    .forEach(([fieldName]) => {
                        aggregateTypes.forEach((fn) => {
                            aggregateType.setField(`${fn}_${fieldName}`, {
                                type: 'Float!',
                            })
                        })
                    })

                t.schemaComposer.Query.setField(
                    `${pluralize(typeName.toLocaleLowerCase())}Aggregate`,
                    {
                        type: aggregateType,
                        args: { where: { type: `${typeName}Filter` } },
                        resolve: createAggregateResolver(t, sequelize),
                    }
                )

                Object.keys(model.associations).forEach((assoc) => {
                    const association = model.associations[assoc]
                    if (association.associationType === 'HasMany') {
                        t.setField(`${association.as}Aggregate`, {
                            type: `${association.target.name}Aggregate`,
                            args: {
                                where: {
                                    type: `${association.target.name}Filter`,
                                },
                            },
                        })
                    }
                })
            }
        )
    })
}
