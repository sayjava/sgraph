import {
    ObjectTypeComposer,
    SchemaComposer,
    ObjectTypeComposerFieldConfig,
} from 'graphql-compose'

export const normalizeTypeName = (typeName: string): string => {
    return typeName.replace(/\[|\]|\!/g, '')
}

export const getModelTypes = (composer: SchemaComposer) => {
    const types = {}

    Array.from(composer.types.values()).forEach((t) => {
        if (!composer.isObjectType(t)) {
            return false
        }

        const obj = t as ObjectTypeComposer<any, any>
        if (obj.getDirectiveByName('model')) {
            types[t.getTypeName()] = t
        }
    })

    return Object.values(types) as ObjectTypeComposer<any, any>[]
}

export const isNumberField = (f: ObjectTypeComposerFieldConfig<any, any>) => {
    return ['Float', 'Int'].includes(normalizeTypeName(f.type.getTypeName()))
}
