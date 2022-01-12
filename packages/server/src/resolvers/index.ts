import { createListResolver } from './list'
import { createPKResolver } from './pk'

export const createResolvers = ({ composer, sequelize }) => {
    createPKResolver({ composer, sequelize })
    createListResolver({ composer, sequelize })
}
