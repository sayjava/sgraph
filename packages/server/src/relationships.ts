import { SchemaComposer, ObjectTypeComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { createTypeListResolver } from './resolvers/list'
import { getModelTypes, normalizeTypeName } from './utils'

interface Arg {
    composer: SchemaComposer
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

            field.directives.forEach((d) => {
                if (RELATIONSHIPS.includes(d.name)) {
                    const relationshipArgs = Object.assign({}, d.args, {
                        as: name,
                    })

                    sourceModel[d.name](targetModel, relationshipArgs)
                }
            })

            if (field.astNode.type.kind === 'ListType') {
                sourceType.setField(
                    name,
                    createTypeListResolver(targetType, sequelize)
                )
            }
        }
    })

    return fields
}

export const createRelationships = ({ composer, sequelize }: Arg) => {
    const types = getModelTypes(composer)
    types.forEach((t) => makeTypeRelationship(t, sequelize))
}
