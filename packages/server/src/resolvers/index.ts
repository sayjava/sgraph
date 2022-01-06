import { createListResolver } from './list'

export const createResolvers = ({ composer, sequelize }) => {
    createListResolver({ composer, sequelize })
}
