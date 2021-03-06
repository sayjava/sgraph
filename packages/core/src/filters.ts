import { ObjectTypeComposer } from 'graphql-compose'
import { DataTypes, Op, Sequelize } from 'sequelize'
import { normalizeTypeName } from './utils'

const createBasicAttributes = (dataType: string) => {
    return {
        [Op.eq.description]: {
            type: dataType,
            description: 'Equal to',
        },
        [Op.ne.description]: {
            type: dataType,
            description: 'Not equal to',
        },
        [Op.is.description]: {
            type: dataType,
            description: 'Is the same as',
        },
        [Op.not.description]: {
            type: dataType,
            description: 'Not same as',
        },
        [Op.or.description]: {
            type: `[${dataType}!]`,
            description: 'Either value',
        },
    }
}

const createNumberFilter = (type: string) => ({
    [Op.gt.description]: {
        type: `${type}`,
        description: 'Greater than',
    },
    [Op.gte.description]: {
        type: `${type}`,
        description: 'Greater than or equal to',
    },
    [Op.lt.description]: {
        type: `${type}`,
        description: 'Less than',
    },
    [Op.lte.description]: {
        type: `${type}`,
        description: 'Less than or equal to',
    },
    [Op.between.description]: {
        type: `[${type}!]`,
        description: 'Is between',
    },
    [Op.notBetween.description]: {
        type: `[${type}!]`,
        description: 'Is not between',
    },
    ...createBasicAttributes(`${type}`),
})

const StringFilters = {
    [Op.like.description]: {
        type: 'String',
        description: 'like',
    },
    [Op.notLike.description]: {
        type: 'String',
        description: 'not like',
    },
    [Op.startsWith.description]: {
        type: 'String',
        description: 'starts with',
    },
    [Op.endsWith.description]: {
        type: 'String',
        description: 'ends with',
    },
    [Op.substring.description]: {
        type: 'String',
        description: 'substring',
    },
    ...createBasicAttributes('String'),

    //   TODO: regex
}

export const createInputFilters = ({
    types,
    sequelize,
}: {
    types: ObjectTypeComposer[]
    sequelize: Sequelize
}) => {
    const [firstType] = types
    const composer = firstType.schemaComposer

    const StringInputFilter = composer.createInputTC({
        name: 'StringFilter',
        fields: StringFilters,
    })

    const IntFilter = composer.createInputTC({
        name: 'IntFilter',
        fields: createNumberFilter('Int'),
    })

    const FloatFilter = composer.createInputTC({
        name: 'FloatFilter',
        fields: createNumberFilter('Float'),
    })

    const BooleanFilter = composer.createInputTC({
        name: 'BooleanFilter',
        fields: createBasicAttributes('Boolean'),
    })

    const BasicFilter = composer.createInputTC({
        name: 'BasicFilter',
        fields: createBasicAttributes('String'),
    })

    composer.types.forEach((t) => {
        if (composer.isObjectType(t)) {
            const obj = t as ObjectTypeComposer<any, any>
            const typeName = normalizeTypeName(obj.getTypeName())
            const modelDirective = obj.getDirectiveByName('model')

            if (modelDirective) {
                composer
                    .getOrCreateITC(`${typeName}Filter`, (tc) => {
                        const model = sequelize.models[typeName]
                        const attrs = Object.entries(model.getAttributes())

                        attrs.forEach(([name, atr]) => {
                            if (
                                atr.type instanceof DataTypes.STRING ||
                                atr.type instanceof DataTypes.TEXT
                            ) {
                                tc.setField(name, {
                                    type: StringInputFilter,
                                    description: `Filter for ${name}`,
                                })
                            } else if (atr.type instanceof DataTypes.INTEGER) {
                                tc.setField(name, {
                                    type: IntFilter,
                                    description: `Filter for ${name}`,
                                })
                            } else if (atr.type instanceof DataTypes.FLOAT) {
                                tc.setField(name, {
                                    type: FloatFilter,
                                    description: `Filter for ${name}`,
                                })
                            } else if (atr.type instanceof DataTypes.BOOLEAN) {
                                tc.setField(name, {
                                    type: BooleanFilter,
                                    description: `Filter for ${name}`,
                                })
                            } else {
                                tc.setField(name, {
                                    type: BasicFilter,
                                    description: `Filter for ${name}`,
                                })
                            }
                        })
                    })
                    .setField(Op.or.description, {
                        type: `[${typeName}Filter!]`,
                        description: `OR Combine Filters`,
                    })
                    .setField(Op.and.description, {
                        type: `[${typeName}Filter!]`,
                        description: `AND Combine Filters`,
                    })
            }
        }
    })
}
