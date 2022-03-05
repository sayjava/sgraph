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

    it('delete order details by id', async () => {
        const deleteRes = await request(app)
            .post('/')
            .send({
                query: `
                    mutation($orderDetailsId: ID!) {
                        response: delete_category_by_pk(id: $orderDetailsId) {
                            affected
                        }
                    }`,
                variables: {
                    orderDetailsId: '1',
                },
            })

        expect(deleteRes.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 1,
            }
        `)
    })
})
