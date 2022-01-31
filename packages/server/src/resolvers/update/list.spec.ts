import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Update Resolver', () => {
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

    it('simple record update', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        orders: update_orders (
                            input: {  ShipName: "xyz" }
                            where: { EmployeeId: { eq: "1" } }
                            limit: 5
                        ) 
                        {
                            affected
                            records {
                                ShipName
                                Employee {
                                    Id
                                }
                            }
                        }
                    }`,
            })

        expect(res.body.data.orders.records).toMatchInlineSnapshot(`
            Array [
              Object {
                "Employee": Object {
                  "Id": 1,
                },
                "ShipName": "xyz",
              },
              Object {
                "Employee": Object {
                  "Id": 1,
                },
                "ShipName": "xyz",
              },
              Object {
                "Employee": Object {
                  "Id": 1,
                },
                "ShipName": "xyz",
              },
              Object {
                "Employee": Object {
                  "Id": 1,
                },
                "ShipName": "xyz",
              },
              Object {
                "Employee": Object {
                  "Id": 1,
                },
                "ShipName": "xyz",
              },
            ]
        `)
    })

    it('non-matching record update', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        orders: update_orders (
                            input: {  ShipName: "new_shipping_name" }
                            where: { EmployeeId: { eq: "unknown_order" } }
                            limit: 5
                        ) 
                        {
                            affected
                            records {
                                Id
                                
                                Employee {
                                    FirstName
                                }
                            }
                        }
                    }`,
            })

        expect(res.body.data.orders.records).toMatchInlineSnapshot(`Array []`)
    })
})
