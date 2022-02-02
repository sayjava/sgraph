import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('PK Resolver', () => {
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

    describe('Single', () => {
        it('should find an order by id`', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        order: find_order_by_pk(id: 22656) {
                            Id
                            ShipName
                        }
                    }`,
                })

            expect(res.body.data.order).toMatchInlineSnapshot(`
                Object {
                  "Id": 22656,
                  "ShipName": "Furia Bacalhau e Frutos do Mar",
                }
            `)
        })

        it('should not return a valid order', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        order: find_order_by_pk(id: 2) {
                            Id
                            ShipName
                        }
                    }`,
                })

            expect(res.body.errors[0].message).toMatchInlineSnapshot(
                `"No Order found with Id 2"`
            )
        })
    })

    describe('Relationship', () => {
        it('on-to-many', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        order: find_order_by_pk(id: 22656) {
                            Id
                            ShipName

                            Listings (limit: 2) {
                              UnitPrice
                            }
                        }
                    }`,
                })

            expect(res.body.data.order).toMatchInlineSnapshot(`
                Object {
                  "Id": 22656,
                  "Listings": Array [
                    Object {
                      "UnitPrice": 14,
                    },
                    Object {
                      "UnitPrice": 30,
                    },
                  ],
                  "ShipName": "Furia Bacalhau e Frutos do Mar",
                }
            `)
        })

        it('on-to-one', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        order_details: find_orderdetail_by_pk(id: "10248/11") {
                            Id

                            Product {
                              ProductName
                            }
                        }
                    }`,
                })

            expect(res.body.data.order_details).toMatchInlineSnapshot(`
                Object {
                  "Id": "10248/11",
                  "Product": Object {
                    "ProductName": "Queso Cabrales",
                  },
                }
            `)
        })
    })
})
