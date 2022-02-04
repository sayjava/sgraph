import { ObjectTypeComposer, pluralize } from 'graphql-compose'
import { Association, Op, Sequelize } from 'sequelize'
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { normalizeTypeName } from '../utils'
import { argsToSequelizeWhere } from './utils'

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
    sequelize: Sequelize,
    association: Association = null
) => {
    const typeName = normalizeTypeName(tc.getTypeName())
    const model = sequelize.models[typeName]

    return async (source, args, ctx, info) => {
        const tree = parseResolveInfo(info)
        const where = argsToSequelizeWhere(args.where)
        const include = aggregateFieldsToFn(tree, sequelize)

        /**
         * potentially, this could be an association aggregate call,
         * we need to account for parent to child association
         */
        if (source && association) {
            // @ts-ignore
            const { sourceKey, foreignKey } = association
            where[foreignKey] = {
                [Op.eq]: source[sourceKey],
            }
        }

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

    types.forEach((tc) => {
        const typeName = normalizeTypeName(tc.getTypeName())
        const model = sequelize.models[typeName]
        const composer = tc.schemaComposer

        composer.getOrCreateOTC(`${typeName}Aggregate`, (aggregateType) => {
            aggregateType.setField('count', { type: 'Int!' })

            /**
             * Generate Aggregation (Number) fields
             *  */
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

            /**
             * Create Query level association resolver
             */
            composer.Query.setField(
                `${typeName.toLocaleLowerCase()}_aggregate`,
                {
                    type: aggregateType,
                    args: { where: { type: `${typeName}Filter` } },
                    resolve: createAggregateResolver(tc, sequelize),
                }
            )

            Object.keys(model.associations).forEach((assoc) => {
                const association = model.associations[assoc]
                if (association.associationType === 'HasMany') {
                    const assocTypeName = association.target.name
                    const assocType = composer.getOTC(assocTypeName)

                    tc.setField(`${association.as}_aggregate`, {
                        type: `${assocTypeName}Aggregate`,
                        args: {
                            where: {
                                type: `${assocTypeName}Filter`,
                            },
                        },
                        resolve: createAggregateResolver(
                            assocType,
                            sequelize,
                            association
                        ),
                    })
                }
            })
        })
    })
}
