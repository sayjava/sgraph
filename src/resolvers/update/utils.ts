import { Op } from 'sequelize'

export const newWhereFromValues = (values: any) => {
    const newWhere = {}
    Object.keys(values).forEach((key) => {
        newWhere[key] = {
            [Op.eq]: values[key],
        }
    })

    return newWhere
}
