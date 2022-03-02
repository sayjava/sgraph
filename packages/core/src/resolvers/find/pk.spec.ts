import request from 'supertest'
import { createServer } from '../../server'

describe('PK Resolver', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
        app = server
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
