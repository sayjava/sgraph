import { ModelCtor } from 'sequelize/dist'

export const extractAttributesFromTree = (tree: any, model: ModelCtor<any>) => {
    const selected = Object.keys(tree).filter(
        (attrKey) => model.rawAttributes[attrKey]
    )

    /**
     * Include associated attributes that is useful for resolvers downstream e.g aggregates
     */
    const associated = Object.keys(model.associations).map((assocKey) => {
        const assoc = model.associations[assocKey]
        /**
         * There is a source key for all associations,
         * it is usually implicitly the primary key of the
         * source model
         */
        // TODO: Fix possible scenarios of multiple primary key attributes
        // @ts-ignore
        return assoc.sourceKey || model.primaryKeyAttribute
    })

    return Array.from(new Set([...selected, ...associated]).values())
}

export const extractChildrenFromTree = (tree: any, model: ModelCtor<any>) => {
    return Object.keys(tree)
        .filter((attrKey) => model.associations[attrKey])
        .map((key) => tree[key])
}
