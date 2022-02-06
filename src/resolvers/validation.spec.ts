import request from 'supertest'
import express from 'express'
import { createTestServer } from '../server'

describe('Validations', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            database: 'sqlite::memory:',
            schema: `
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
    })

    it('email', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
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
                        user: create_user(input: 
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
                        user: create_user(input: 
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
                        user: create_user(input: 
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
                        user: create_users(inputs: 
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