export const normalizeTypeName = (typeName: string): string => {
    return typeName.replace(/\[|\]|\!/g, '')
}
