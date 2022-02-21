import request from 'supertest'
import { createTestServer } from '../../server'

describe('Find', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
    })

    describe('Filtering', () => {
        describe('Basic', () => {
            it('eq', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { ShipName: { eq: "Wolski Zajazd" } }, limit: 2) {
                            count
                            orders {
                                Id
                                ShipName
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 170,
                      "orders": Array [
                        Object {
                          "Id": 10374,
                          "ShipName": "Wolski Zajazd",
                        },
                        Object {
                          "Id": 10611,
                          "ShipName": "Wolski Zajazd",
                        },
                      ],
                    }
                `)
            })

            it('ne', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { ShipName: { ne: "Wolski Zajazd" } }, limit: 2) {
                            count
                            orders {
                                Id
                                ShipName
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 16648,
                      "orders": Array [
                        Object {
                          "Id": 10248,
                          "ShipName": "Vins et alcools Chevalier",
                        },
                        Object {
                          "Id": 10249,
                          "ShipName": "Toms Spezialitäten",
                        },
                      ],
                    }
                `)
            })

            it('is', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: find_orders(where: { EmployeeId: { is: "2" } }, limit: 2) {
                            count
                            orders {
                                EmployeeId
                                ShipName
                            }
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Object {
                      "count": 1805,
                      "orders": Array [
                        Object {
                          "EmployeeId": "2",
                          "ShipName": "Blondel père et fils",
                        },
                        Object {
                          "EmployeeId": "2",
                          "ShipName": "Morgenstern Gesundkost",
                        },
                      ],
                    }
                `)
            })

            it('count', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: find_orders(where: { EmployeeId: { is: "2" } }, limit: 2) {
                          count
                        }
                    }`,
                    })

                expect(res.body.data).toMatchInlineSnapshot(`
                    Object {
                      "users": Object {
                        "count": 16818,
                      },
                    }
                `)
            })

            it('or', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { EmployeeId: { or: ["5", "2"] } } limit: 5) {
                            count 
                            orders {
                                Id
                                EmployeeId
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 3664,
                      "orders": Array [
                        Object {
                          "EmployeeId": "5",
                          "Id": 10248,
                        },
                        Object {
                          "EmployeeId": "5",
                          "Id": 10254,
                        },
                        Object {
                          "EmployeeId": "2",
                          "Id": 10265,
                        },
                        Object {
                          "EmployeeId": "5",
                          "Id": 10269,
                        },
                        Object {
                          "EmployeeId": "2",
                          "Id": 10277,
                        },
                      ],
                    }
                `)
            })

            it('logical or', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders( where: {
                            or: [{ CustomerId: { substring: "REGGC" } }, { ShipName: { substring: "Seven" } }]
                        }, limit: 5 ) {
                            count
                            orders {
                                CustomerId
                                ShipName
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 377,
                      "orders": Array [
                        Object {
                          "CustomerId": "REGGC",
                          "ShipName": "Reggiani Caseifici",
                        },
                        Object {
                          "CustomerId": "SEVES",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "SEVES",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "SEVES",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "REGGC",
                          "ShipName": "Reggiani Caseifici",
                        },
                      ],
                    }
                `)
            })

            it('logical and', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders( where: {
                            and: [{ ShipName: { startsWith: "Seven" } }, { CustomerId: { eq: "RANCH" } }]
                        } ) {
                            count
                            orders {
                                CustomerId
                                ShipName
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 5,
                      "orders": Array [
                        Object {
                          "CustomerId": "RANCH",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "RANCH",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "RANCH",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "RANCH",
                          "ShipName": "Seven Seas Imports",
                        },
                        Object {
                          "CustomerId": "RANCH",
                          "ShipName": "Seven Seas Imports",
                        },
                      ],
                    }
                `)
            })
        })

        describe('String', () => {
            it('like', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { ShipAddress: { like: "South House 300 Queensbridge" } }, limit: 5) {
                            count
                            orders {
                                CustomerId
                                ShipAddress
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 182,
                      "orders": Array [
                        Object {
                          "CustomerId": "NORTS",
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "CustomerId": "NORTS",
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "CustomerId": "NORTS",
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "CustomerId": "SAVEA",
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "CustomerId": "SIMOB",
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                      ],
                    }
                `)
            })

            it('not like', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { ShipAddress: { notLike: "South House 300 Queensbridge" } }, limit: 5) {
                            count
                            orders {
                                CustomerId
                                ShipAddress
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 16636,
                      "orders": Array [
                        Object {
                          "CustomerId": "VINET",
                          "ShipAddress": "59 rue de l'Abbaye",
                        },
                        Object {
                          "CustomerId": "TOMSP",
                          "ShipAddress": "Luisenstr. 48",
                        },
                        Object {
                          "CustomerId": "HANAR",
                          "ShipAddress": "Rua do Paço, 67",
                        },
                        Object {
                          "CustomerId": "VICTE",
                          "ShipAddress": "2, rue du Commerce",
                        },
                        Object {
                          "CustomerId": "SUPRD",
                          "ShipAddress": "Boulevard Tirou, 255",
                        },
                      ],
                    }
                `)
            })

            it('startsWith', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { OrderDate: { startsWith: "2015-08-12" } }, limit: 5) {
                            count
                            orders {
                                Id
                                OrderDate
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 11,
                      "orders": Array [
                        Object {
                          "Id": 13098,
                          "OrderDate": "2015-08-12 21:14:12",
                        },
                        Object {
                          "Id": 13370,
                          "OrderDate": "2015-08-12 16:46:05",
                        },
                        Object {
                          "Id": 13498,
                          "OrderDate": "2015-08-12 19:43:31",
                        },
                        Object {
                          "Id": 15603,
                          "OrderDate": "2015-08-12 01:15:05",
                        },
                        Object {
                          "Id": 19619,
                          "OrderDate": "2015-08-12 06:01:44",
                        },
                      ],
                    }
                `)
            })

            it('endsWith', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { ShipRegion: { endsWith: "Europe" } }, limit: 5) {
                            count
                            orders {
                                Id
                                ShipRegion
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 7813,
                      "orders": Array [
                        Object {
                          "Id": 10248,
                          "ShipRegion": "Western Europe",
                        },
                        Object {
                          "Id": 10249,
                          "ShipRegion": "Western Europe",
                        },
                        Object {
                          "Id": 10251,
                          "ShipRegion": "Western Europe",
                        },
                        Object {
                          "Id": 10252,
                          "ShipRegion": "Western Europe",
                        },
                        Object {
                          "Id": 10254,
                          "ShipRegion": "Western Europe",
                        },
                      ],
                    }
                `)
            })

            it('substring', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { ShipAddress: { substring: "House 300" } }, limit: 5) {
                            count
                            orders {
                                Id
                                ShipAddress
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 182,
                      "orders": Array [
                        Object {
                          "Id": 10517,
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "Id": 10752,
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "Id": 11057,
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "Id": 11088,
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                        Object {
                          "Id": 11158,
                          "ShipAddress": "South House 300 Queensbridge",
                        },
                      ],
                    }
                `)
            })
        })

        describe('Int', () => {
            it('gt', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { Freight: { gt: 200 } }, limit: 5) {
                            count
                            orders {
                              CustomerId
                              Freight
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 9792,
                      "orders": Array [
                        Object {
                          "CustomerId": "MORGK",
                          "Freight": 328.25,
                        },
                        Object {
                          "CustomerId": "SANTG",
                          "Freight": 284.25,
                        },
                        Object {
                          "CustomerId": "MEREP",
                          "Freight": 274.5,
                        },
                        Object {
                          "CustomerId": "OLDWO",
                          "Freight": 498,
                        },
                        Object {
                          "CustomerId": "THECR",
                          "Freight": 520.5,
                        },
                      ],
                    }
                `)
            })

            it('gte', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { Freight: { gte: 79.25 } }, limit: 5) {
                            count
                            orders {
                              CustomerId
                              Freight
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 13862,
                      "orders": Array [
                        Object {
                          "CustomerId": "QUICK",
                          "Freight": 81.5,
                        },
                        Object {
                          "CustomerId": "SAVEA",
                          "Freight": 80,
                        },
                        Object {
                          "CustomerId": "SAVEA",
                          "Freight": 82,
                        },
                        Object {
                          "CustomerId": "ERNSH",
                          "Freight": 96.5,
                        },
                        Object {
                          "CustomerId": "SAVEA",
                          "Freight": 92.5,
                        },
                      ],
                    }
                `)
            })

            it('lt', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { Freight: { lt: 79.25 } }, limit: 5) {
                            count
                            orders {
                              CustomerId
                              Freight
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 2956,
                      "orders": Array [
                        Object {
                          "CustomerId": "VINET",
                          "Freight": 16.75,
                        },
                        Object {
                          "CustomerId": "TOMSP",
                          "Freight": 22.25,
                        },
                        Object {
                          "CustomerId": "HANAR",
                          "Freight": 25,
                        },
                        Object {
                          "CustomerId": "VICTE",
                          "Freight": 20.25,
                        },
                        Object {
                          "CustomerId": "SUPRD",
                          "Freight": 36.25,
                        },
                      ],
                    }
                `)
            })

            it('lte', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                         orders: find_orders(where: { Freight: { lte: 20 } }, limit: 5) {
                            count
                            orders {
                              CustomerId
                              Freight
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 582,
                      "orders": Array [
                        Object {
                          "CustomerId": "VINET",
                          "Freight": 16.75,
                        },
                        Object {
                          "CustomerId": "WELLI",
                          "Freight": 16.75,
                        },
                        Object {
                          "CustomerId": "CENTC",
                          "Freight": 12.75,
                        },
                        Object {
                          "CustomerId": "QUEDE",
                          "Freight": 20,
                        },
                        Object {
                          "CustomerId": "RATTC",
                          "Freight": 17.25,
                        },
                      ],
                    }
                `)
            })

            it('between', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { Freight: { between: [20, 40] } }, limit: 5) {
                          count
                          orders {
                            CustomerId
                            Freight
                          }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 1029,
                      "orders": Array [
                        Object {
                          "CustomerId": "TOMSP",
                          "Freight": 22.25,
                        },
                        Object {
                          "CustomerId": "HANAR",
                          "Freight": 25,
                        },
                        Object {
                          "CustomerId": "VICTE",
                          "Freight": 20.25,
                        },
                        Object {
                          "CustomerId": "SUPRD",
                          "Freight": 36.25,
                        },
                        Object {
                          "CustomerId": "HANAR",
                          "Freight": 35.5,
                        },
                      ],
                    }
                `)
            })

            it('notbetween', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { Freight: { notBetween: [0, 400] } }, limit: 5) {
                          count
                          orders {
                            CustomerId
                            Freight
                          }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "count": 3303,
                      "orders": Array [
                        Object {
                          "CustomerId": "OLDWO",
                          "Freight": 498,
                        },
                        Object {
                          "CustomerId": "THECR",
                          "Freight": 520.5,
                        },
                        Object {
                          "CustomerId": "LAMAI",
                          "Freight": 403,
                        },
                        Object {
                          "CustomerId": "PRINI",
                          "Freight": 487.25,
                        },
                        Object {
                          "CustomerId": "MAGAA",
                          "Freight": 476.5,
                        },
                      ],
                    }
                `)
            })
        })

        describe.skip('Boolean', () => {
            it('eq', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders(where: { Shipped: { eq: true } }) {
                            count
                            orders {
                              CustomerId
                              Shipped
                            }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "blocked": true,
                        "name": "danlard",
                      },
                    ]
                `)
            })
        })
    })

    describe('Order', () => {
        describe('Basic', () => {
            it('order by asc', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        orders: find_orders( order_by: { RequiredDate: ASC }, limit: 5 ) {
                          orders {
                            RequiredDate
                          }
                        }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "orders": Array [
                        Object {
                          "RequiredDate": "2012-07-11 16:52:11",
                        },
                        Object {
                          "RequiredDate": "2012-07-12 00:56:52",
                        },
                        Object {
                          "RequiredDate": "2012-07-13 05:56:00",
                        },
                        Object {
                          "RequiredDate": "2012-07-13 06:42:36",
                        },
                        Object {
                          "RequiredDate": "2012-07-14 19:24:42",
                        },
                      ],
                    }
                `)
            })

            it('order by desc', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                         orders: find_orders( order_by: { Freight: DESC }, limit: 5 ) {
                          orders {
                            Freight
                          }
                         }
                    }`,
                    })

                expect(res.body.data.orders).toMatchInlineSnapshot(`
                    Object {
                      "orders": Array [
                        Object {
                          "Freight": 591.25,
                        },
                        Object {
                          "Freight": 582.75,
                        },
                        Object {
                          "Freight": 581.5,
                        },
                        Object {
                          "Freight": 574.75,
                        },
                        Object {
                          "Freight": 573,
                        },
                      ],
                    }
                `)
            })
        })
    })

    describe('Pagination', () => {
        it('pages offset and limit', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        orders: find_orders( limit: 5, offset: 10 ) {
                          orders {
                            ShipName
                          }
                        }
                    }`,
                })

            expect(res.body.data.orders).toMatchInlineSnapshot(`
                Object {
                  "orders": Array [
                    Object {
                      "ShipName": "Ernst Handel",
                    },
                    Object {
                      "ShipName": "Centro comercial Moctezuma",
                    },
                    Object {
                      "ShipName": "Ottilies Käseladen",
                    },
                    Object {
                      "ShipName": "Que Delícia",
                    },
                    Object {
                      "ShipName": "Rattlesnake Canyon Grocery",
                    },
                  ],
                }
            `)
        })
    })
})
