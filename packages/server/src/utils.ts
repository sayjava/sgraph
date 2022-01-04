import { ObjectTypeComposer, SchemaComposer } from 'graphql-compose'

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
