import request from 'supertest'
import { createTestServer } from '../../server'

describe('Multi Create', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
    })

    it('creates multiple model', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        employees: create_employees(inputs: 
                        [
                            { 
                                FirstName: "Employee-12", 
                                LastName: "Nortwind-12", 
                                ReportsTo: 2,
                                Country: "UK"
                            },
                            { 
                                FirstName: "Employee-13", 
                                LastName: "Nortwind-13", 
                                ReportsTo: 5,
                                Country: "UK"
                            }
                        ]
                        ) {
                            Manager {
                                Id
                                FirstName
                            }
                        }
                    }`,
            })

        expect(res.body.data.employees).toMatchInlineSnapshot(`
            Array [
              Object {
                "Manager": Object {
                  "FirstName": "Andrew",
                  "Id": 2,
                },
              },
              Object {
                "Manager": Object {
                  "FirstName": "Steven",
                  "Id": 5,
                },
              },
            ]
        `)
    })

    it.only('creates multiple models with relationships', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        orders: create_orders(inputs: 
                        [
                            {
                                Id: 28066,
                                Freight: 20,
                                ShipName: "New-Order-1",
                                ShipAddress: "London",
                                EmployeeId: "8",
                                Listings: [
                                    {
                                        Id: "multi-detail-1",
                                        UnitPrice: 10.2,
                                        Quantity: 4,
                                        ProductId: "1",
                                        Discount: 0
                                    },
                                ]
                            },
                            {
                                Id: 28067,
                                Freight: 30,
                                ShipName: "New-Order-2",
                                ShipAddress: "London",
                                EmployeeId: "8",
                                Listings: [
                                    {
                                        Id: "multi-detail-2",
                                        UnitPrice: 10.2,
                                        Quantity: 4,
                                        ProductId: "3",
                                        Discount: 0
                                    },
                                ]
                            }
                        ]
                        ) {
                           ShipName
                           Products {
                               ProductName
                           }
                        }
                    }`,
            })

        expect(res.body.data.orders).toMatchInlineSnapshot(`
            Array [
              Object {
                "Products": Array [
                  Object {
                    "ProductName": "Chai",
                  },
                ],
                "ShipName": "New-Order-1",
              },
              Object {
                "Products": Array [
                  Object {
                    "ProductName": "Aniseed Syrup",
                  },
                ],
                "ShipName": "New-Order-2",
              },
            ]
        `)
    })
})
