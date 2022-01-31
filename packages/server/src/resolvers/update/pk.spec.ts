import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Update PK Resolver', () => {
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
