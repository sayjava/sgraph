import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Delete Resolver', () => {
    let app
    let sequelize: Sequelize

    beforeAll(async () => {
        app = express()
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './test/fixtures/northwind.sqlite',
            logging: false,
        })
        const typeDefs = readFileSync(
            './test/fixtures/northwind.graphql',
            'utf-8'
        )

        const graphqlHttp = createHTTPGraphql({
            sequelize,
            typeDefs,
        })

        app.use(graphqlHttp)
    })

    it('delete an order, deletes details', async () => {
        const orderId = 22656
        const deleteRes = await request(app)
            .post('/')
            .send({
                query: `
                    mutation($orderId: Int) {
                        response: deleteOrders(where: { Id: { eq: $orderId } }) {
                           affected
                        }
                    }`,
                variables: {
                    orderId,
                },
            })

        const detailsRes = await request(app)
            .post('/')
            .send({
                query: `query($orderId: String) {
                        response: findOrderDetails(where: { OrderId: { eq: $orderId } }, limit: 1) {
                           OrderId
                           UnitPrice
                        }
                    }`,
                variables: {
                    orderId: String(orderId),
                },
            })

        expect(detailsRes.body.data.response).toMatchInlineSnapshot(`
            Array [
              Object {
                "OrderId": "22656",
                "UnitPrice": 14,
              },
            ]
        `)

        expect(deleteRes.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 1,
            }
        `)
    })
})
