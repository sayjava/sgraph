import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../server'

describe('Delete Resolver', () => {
    let app

    beforeAll(async () => {
        app = express()
        const { handler } = createHTTPGraphql({
            typeDefs: './test/fixtures/northwind.graphql',
            databaseUrl: 'sqlite:test/fixtures/northwind.sqlite',
        })

        app.use(handler)
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
