import request from 'supertest'
import { createTestServer } from '../../server'

describe('Update Resolver', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
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
