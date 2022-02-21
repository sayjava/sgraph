import request from 'supertest'
import { createServer } from '../server'

describe('Validations', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            database: 'sqlite::memory:',
            schema: `
                type User @model {
                    id: ID @primaryKey
                    email: Email
                    ip4: IPv4
                    ip6: IPv6
                    url: URL
                    creditCard: CreditCard
                    when: Date
                    uuid: UUID

                    address: String @validate_contains(value: "UK_")
                    postcode: String @validate_is(value: "[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}")
                    queue: Int @autoIncrement
                }
              `,
        })

        app = server
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
                                ip4: "1234567", 
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation isIPv4 on ip4 failed"`
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
                                ip4: "127.0.0.1",
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
                                ip4: "127.0.0.1",
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

    it('url', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ip4: "127.0.0.1",
                                address: "UK_No_10"
                                postcode: "SW1A2AA"
                                url: "some_useless_url"
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation isUrl on url failed"`
        )
    })

    it('credit card', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ip4: "127.0.0.1",
                                address: "UK_No_10"
                                postcode: "SW1A2AA"
                                url: "https://yahoo.com"
                                creditCard: 1111
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation isCreditCard on creditCard failed"`
        )
    })

    it('date', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ip4: "127.0.0.1",
                                address: "UK_No_10"
                                postcode: "SW1A2AA"
                                url: "https://yahoo.com"
                                creditCard: 1111
                                when: "some-day"
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Query error: Invalid date"`
        )
    })

    it('uuid', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ip4: "127.0.0.1",
                                address: "UK_No_10"
                                postcode: "SW1A2AA"
                                url: "https://yahoo.com"
                                creditCard: "4242 4242 4242 4242"
                                when: "2011-11-05"
                                uuid: "none-uuid"
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Validation error: Validation isUUID on uuid failed"`
        )
    })

    it('validates all', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                                ip4: "127.0.0.1",
                                address: "UK_No_10"
                                postcode: "SW1A2AA"
                                url: "https://yahoo.com"
                                creditCard: "4242 4242 4242 4242"
                                when: "2011-11-05"
                                uuid: "b3426978-b8ec-4fad-9f10-d030e95a23ef"
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors).toMatchInlineSnapshot(`undefined`)
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
                                    ip4: "127.0.0.1",
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
