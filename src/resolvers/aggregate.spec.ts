import request from 'supertest'
import { createTestServer } from '../server'

describe('Aggregate', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            schema: './northwind/schema.graphql',
            database: 'sqlite:northwind/database.sqlite',
        })
    })

    describe('field', () => {
        it('sums, avg, min, max, sum, count', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        orders: order_aggregate(where: { Freight: { gt: 400 } }) {
                            count
                            total_Freight
                            avg_Freight
                            min_Freight
                            sum_Freight
                            max_Freight
                        }
                    }`,
                })

            expect(res.body.data.orders).toMatchInlineSnapshot(`
                Object {
                  "avg_Freight": 456.6736300333031,
                  "count": 3303,
                  "max_Freight": 591.25,
                  "min_Freight": 400.25,
                  "sum_Freight": 1508393,
                  "total_Freight": 1508393,
                }
            `)
        })

        it('fetches relationship aggregate', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        order: find_order_by_pk(id: 20167) {
                            ShipName
                            Listings_aggregate {
                                count
                                avg_UnitPrice
                                min_UnitPrice
                                sum_UnitPrice
                                max_UnitPrice
                            }
                        }
                    }`,
                })

            expect(res.body.data.order).toMatchInlineSnapshot(`
                Object {
                  "Listings_aggregate": Object {
                    "avg_UnitPrice": 33.581320754716984,
                    "count": 53,
                    "max_UnitPrice": 263.5,
                    "min_UnitPrice": 4.5,
                    "sum_UnitPrice": 1779.8100000000002,
                  },
                  "ShipName": "Vins et alcools Chevalier",
                }
            `)
        })

        it('fetches relationship aggregate with filter', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        order: find_order_by_pk(id: 20167) {
                            ShipName
                            Listings_aggregate (where: { UnitPrice: { gte: 40 } } ) {
                                count
                                avg_UnitPrice
                                min_UnitPrice
                                sum_UnitPrice
                                max_UnitPrice
                            }
                        }
                    }`,
                })

            expect(res.body.data.order).toMatchInlineSnapshot(`
                Object {
                  "Listings_aggregate": Object {
                    "avg_UnitPrice": 83.18090909090908,
                    "count": 11,
                    "max_UnitPrice": 263.5,
                    "min_UnitPrice": 40,
                    "sum_UnitPrice": 914.9899999999999,
                  },
                  "ShipName": "Vins et alcools Chevalier",
                }
            `)
        })

        it('fetches orders', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        orders: find_orders(where: { Freight: { gt: 450 } }, limit: 2) {
                            records {
                                ShipName
                                Listings_aggregate (where: { UnitPrice: { gte: 40 } } ) {
                                    count
                                    avg_UnitPrice
                                    min_UnitPrice
                                    sum_UnitPrice
                                    max_UnitPrice
                                }
                            }
                        }
                    }`,
                })

            expect(res.body.data.orders.records).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "Listings_aggregate": Object {
                      "avg_UnitPrice": 77.26846153846154,
                      "count": 13,
                      "max_UnitPrice": 263.5,
                      "min_UnitPrice": 40,
                      "sum_UnitPrice": 1004.4899999999999,
                    },
                    "ShipName": "Furia Bacalhau e Frutos do Mar",
                  },
                  Object {
                    "Listings_aggregate": Object {
                      "avg_UnitPrice": 77.26846153846154,
                      "count": 13,
                      "max_UnitPrice": 263.5,
                      "min_UnitPrice": 40,
                      "sum_UnitPrice": 1004.49,
                    },
                    "ShipName": "Let's Stop N Shop",
                  },
                ]
            `)
        })
    })
})
