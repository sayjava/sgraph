import request from 'supertest'
import { createServer } from '../../server'

describe('Update PK Resolver', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
        app = server
    })

    it('update by pk', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        employee: update_employee_by_pk ( 
                            id: "1",
                            input: {  FirstName: "James" }
                        ) 
                        {
                            Id
                            FirstName
                            LastName
                        }
                    }`,
            })

        expect(res.body.data).toMatchInlineSnapshot(`
            Object {
              "employee": Object {
                "FirstName": "James",
                "Id": 1,
                "LastName": "Davolio",
              },
            }
        `)
    })

    it('update none existing pk', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        employee: update_employee_by_pk ( 
                            id: "unknown_pk",
                            input: {  FirstName: "James" }
                        ) 
                        {
                            Id
                            FirstName
                            LastName
                        }
                    }`,
            })

        expect(res.body.errors).toMatchInlineSnapshot(`
            Array [
              Object {
                "locations": Array [
                  Object {
                    "column": 25,
                    "line": 2,
                  },
                ],
                "message": "No updates done for Employee with primary key unknown_pk",
                "path": Array [
                  "employee",
                ],
              },
            ]
        `)
    })
})
