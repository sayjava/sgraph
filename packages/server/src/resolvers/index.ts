import { createCreateResolver } from './create'
import { createInputs } from './inputs'
import { createListResolver } from './list'
import { createPKResolver } from './pk'
import { createUpdateResolver } from './update'

export const createResolvers = ({ types, sequelize }) => {
    createPKResolver({ types, sequelize })
    createListResolver({ types, sequelize })
    createInputs({ types, sequelize })
    createCreateResolver({ types, sequelize })
    createUpdateResolver({ types, sequelize })
}
