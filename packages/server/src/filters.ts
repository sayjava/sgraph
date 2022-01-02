import { SchemaComposer, ObjectTypeComposer } from 'graphql-compose'
import { Op, Sequelize } from 'sequelize'
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
            description: 'Not same as',
        },
    }
}

const NumberFilters = {
    [Op.gt.description]: {
        type: 'Int',
        description: 'greater than',
    },
    [Op.gte.description]: {
        type: 'Int',
        description: 'greater than or equal to',
    },
    [Op.lt.description]: {
        type: 'Int',
        description: 'less than',
    },
    [Op.lte.description]: {
        type: 'Int',
        description: 'less than or equal to',
    },
    [Op.between.description]: {
        type: '[Int!]',
        description: 'is between',
    },
    [Op.notBetween.description]: {
        type: '[Int!]',
        description: 'is not between',
    },
    ...createBasicAttributes('Int'),
}

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
    composer,
    sequelize,
}: {
    composer: SchemaComposer
    sequelize: Sequelize
}) => {
    const StringInputFilter = composer.createInputTC({
        name: 'StringFilter',
        fields: StringFilters,
    })

    const NumberFilter = composer.createInputTC({
        name: 'NumberFilter',
        fields: NumberFilters,
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
                composer.getOrCreateITC(`${typeName}Filter`, (tc) => {
                    const model = sequelize.models[typeName]
                    const attrs = Object.entries(model.getAttributes())

                    attrs.forEach(([name, atr]) => {
                        switch (atr.type) {
                            case 'String':
                            case 'ID':
                            case 'Text':
                                tc.setField(name, {
                                    type: StringInputFilter,
                                    description: `Filter for ${name}`,
                                })
                                break

                            case 'Int':
                            case 'Float':
                                tc.setField(name, {
                                    type: NumberFilter,
                                    description: `Filter for ${name}`,
                                })
                                break
                            case 'Boolean':
                                tc.setField(name, {
                                    type: BooleanFilter,
                                    description: `Filter for ${name}`,
                                })
                                break

                            default:
                                tc.setField(name, {
                                    type: BasicFilter,
                                    description: `Filter for ${name}`,
                                })
                        }
                    })
                })
            }
        }
    })
}
