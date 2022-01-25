import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../server'
import { Sequelize } from 'sequelize'

describe('Validations', () => {
    let app
    let sequelize: Sequelize

    beforeAll(async () => {
        app = express()
        sequelize = new Sequelize('sqlite::memory:', { logging: false })
        const graphqlHttp = createHTTPGraphql({
            sequelize,
            typeDefs: `
                type User @model {
                    id: ID @primaryKey
                    email: String @validate_isEmail
                    ipAddress: String @validate_isIP
                    address: String @validate_contains(value: "UK_")
                    postcode: String @validate_is(value: "^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$")
                    queue: Int @autoIncrement
                }
              `,
        })

        app.use(graphqlHttp)
        await sequelize.sync({ force: true })
    })

    it('email', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(user: 
                            { 
                                id: "email", 
                                email: "faike_email.com", 
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation isEmail on email failed"`
        )
    })

    it('ip address', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(user: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ipAddress: "1234567", 
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation isIP on ipAddress failed"`
        )
    })

    it('address', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(user: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ipAddress: "127.0.0.1",
                                address: "AB_No_10" 
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation contains on address failed"`
        )
    })

    it('regex', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(user: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ipAddress: "127.0.0.1",
                                address: "UK_No_10"
                                postcode: "12343"
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation is on postcode failed"`
        )
    })

    it('bulk validation', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUsers(users: 
                            [
                                { 
                                    id: "email", 
                                    email: "bademail.com"
                                },
                                { 
                                    id: "email", 
                                    email: "faike@email.com", 
                                    ipAddress: "127.0.0.1",
                                    address: "UK_No_10"
                                    postcode: "12343"
                                }
                            ]
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(`
            "Validation error: Validation isEmail on email failed
            Validation error: Validation is on postcode failed"
        `)
    })
})
