import request from 'supertest'
import { createTestServer } from '../../server'

describe('Delete Resolver', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            schema: './northwind/schema.graphql',
            database: 'sqlite:northwind/database.sqlite',
        })
    })

    it('delete order details by id', async () => {
        const deleteRes = await request(app)
            .post('/')
            .send({
                query: `
                    mutation($orderDetailsId: ID!) {
                        response: delete_orderdetail_by_pk(id: $orderDetailsId) {
                            affected
                        }
                    }`,
                variables: {
                    orderDetailsId: '10258/2',
                },
            })

        expect(deleteRes.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 1,
            }
        `)
    })
})
