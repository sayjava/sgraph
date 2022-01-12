export const attributesFromTree = (leaf: any) => {
    return Object.keys(leaf).filter((attrKey) => {
        const children = leaf[attrKey].fieldsByTypeName
        return Object.keys(children).length === 0
    })
}

export const childrenFromTree = (leaf: any) => {
    return Object.keys(leaf)
        .filter((attrKey) => {
            const children = leaf[attrKey].fieldsByTypeName
            return Object.keys(children).length > 0
        })
        .map((key) => leaf[key])
}
