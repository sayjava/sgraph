import request from 'supertest'
import { createServer } from '../../server'

describe('Delete Resolver', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
        app = server
    })

    it('delete an order, deletes details', async () => {
        const freight = 400
        const deleteRes = await request(app)
            .post('/')
            .send({
                query: `
                    mutation($freight: Float) {
                        response: delete_orders(where: { Freight: { gte: $freight } }) {
                           affected
                        }
                    }`,
                variables: {
                    freight,
                },
            })

        expect(deleteRes.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 3310,
            }
        `)
    })
})
