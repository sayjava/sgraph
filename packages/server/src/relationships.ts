import { ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { createRelationship } from './resolvers/list'
import { normalizeTypeName } from './utils'

interface Arg {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}

const RELATIONSHIPS = ['hasOne', 'belongsTo', 'hasMany', 'belongsToMany']

const makeTypeRelationship = (
    sourceType: ObjectTypeComposer,
    sequelize: Sequelize
) => {
    const fields: { [key: string]: ObjectTypeComposer }[] = []
    const sourceTypeName = normalizeTypeName(sourceType.getTypeName())
    const sourceModel = sequelize.models[sourceTypeName]

    sourceType.getFieldNames().forEach((name) => {
        const field = sourceType.getField(name)
        const targetTypeName = normalizeTypeName(field.type.getTypeName())

        if (!sourceType.schemaComposer.isScalarType(targetTypeName)) {
            const targetModel = sequelize.models[targetTypeName]
            const targetType = sourceType.schemaComposer.getOTC(targetTypeName)

            field.directives.forEach((relationshipDirective) => {
                if (RELATIONSHIPS.includes(relationshipDirective.name)) {
                    const relationshipArgs = Object.assign(
                        {},
                        relationshipDirective.args,
                        {
                            as: name,
                        }
                    )

                    sourceModel[relationshipDirective.name](
                        targetModel,
                        relationshipArgs
                    )

                    /**
                     * An aggregate relationship is created to allow for the querying
                     * of aggregate relationships of one-to-many types
                     *
                     * e.g findUsers { postAggregate { max_views } }
                     */
                    if (relationshipDirective.name === 'hasMany') {
                        sourceModel.hasOne(targetModel, {
                            ...relationshipArgs,
                            as: `${name}Aggregate`,
                        })
                    }
                }
            })

            if (field.astNode.type.kind === 'ListType') {
                sourceType.setField(name, createRelationship(targetType))
            }
        }
    })

    return fields
}

export const createRelationships = ({ types, sequelize }: Arg) => {
    types.forEach((t) => makeTypeRelationship(t, sequelize))
}
