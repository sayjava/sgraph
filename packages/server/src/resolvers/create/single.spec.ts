import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Single Create', () => {
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

    it('creates a simple model', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        employee: create_employee(input: 
                            { 
                                FirstName: "Employee-11", 
                                LastName: "Nortwind-11", 
                                ReportsTo: 2,
                                Country: "UK"
                            }
                        ) {
                            Manager {
                                Id
                                FirstName
                            }
                        }
                    }`,
            })

        expect(res.body.data.employee).toMatchInlineSnapshot(`
            Object {
              "Manager": Object {
                "FirstName": "Andrew",
                "Id": 2,
              },
            }
        `)
    })

    it('creates a single model with associations', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        customer: create_customer(input: 
                            { 
                                Id: "AROUT-2",
                                CompanyName: "Customer-1", 
                                ContactName: "New-Customer", 
                                Orders: [
                                    {
                                       Id: 27066,
                                       Freight: 20,
                                       ShipName: "New Ship",
                                       ShipAddress: "London",
                                       EmployeeId: "8",

                                       Listings: [
                                           {
                                               Id: "detail-1",
                                               UnitPrice: 10.2,
                                               Quantity: 4,
                                               ProductId: "1",
                                               Discount: 0
                                           },
                                       ]
                                    }
                                ]
                            }
                        ) {
                            Id
                            Orders {
                                Id
                                ShipName
                                
                                Customer {
                                    ContactName
                                }

                                Employee {
                                    FirstName
                                }

                                Listings {
                                    Id
                                    OrderId
                                    UnitPrice

                                    Product {
                                        ProductName
                                    }
                                }
                              
                            }
                        }
                    }`,
            })

        expect(res.body.data.customer).toMatchInlineSnapshot(`
            Object {
              "Id": "AROUT-2",
              "Orders": Array [
                Object {
                  "Customer": Object {
                    "ContactName": "New-Customer",
                  },
                  "Employee": Object {
                    "FirstName": "Laura",
                  },
                  "Id": 27066,
                  "Listings": Array [
                    Object {
                      "Id": "detail-1",
                      "OrderId": "27066",
                      "Product": Object {
                        "ProductName": "Chai",
                      },
                      "UnitPrice": 10.2,
                    },
                  ],
                  "ShipName": "New Ship",
                },
              ],
            }
        `)
    })
})
