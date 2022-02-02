import { createCreateResolver } from './create'
import { createDeleteResolver } from './delete'
import { createInputs } from './inputs'
import { createPKResolver } from './pk'
import { createUpdateResolver } from './update'
import { createFindResolver } from './find'

export const createResolvers = ({ types, sequelize }) => {
    createFindResolver({ types, sequelize })
    createPKResolver({ types, sequelize })
    createInputs({ types, sequelize })
    createCreateResolver({ types, sequelize })
    createUpdateResolver({ types, sequelize })
    createDeleteResolver({ types, sequelize })
}
