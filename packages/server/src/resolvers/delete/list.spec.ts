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
