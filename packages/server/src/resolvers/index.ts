import { createListResolver } from './list'
import { createPKResolver } from './pk'

export const createResolvers = ({ types, sequelize }) => {
    createPKResolver({ types, sequelize })
    createListResolver({ types, sequelize })
}
