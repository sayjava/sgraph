import request from 'supertest'
import { createServer } from './server'

describe('DB Types', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            database: 'sqlite::memory:',
            schema: `
                type User @model @autoTimestamp {
                    id: ID @primaryKey
                    email: Email
                    queue: Int @autoIncrement
                    uuid: UUID
                    date: DateTime
                    dateOnly: Date
                    address: JSON
                }
              `,
        })

        app = server
    })

    it('autoincrement', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(user: 
                            { 
                                id: "email", 
                                email: "faike@email.com",
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Object {
              "id": "email",
            }
        `)
    })

    it('timestamps', async () => {
        await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(user: 
                            { 
                                id: "email", 
                                email: "faike@email.com"
                            }
                        ) {
                            id
                            queue
                        }
                    }`,
            })

        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        users: update_users(data: 
                            { 
                                email: "new@email.com", 
                            },
                            where: { id: { eq: "email" } }
                        ) {
                            records {
                                id
                                queue
                                createdAt
                                updatedAt
                            }
                          
                        }
                    }`,
            })

        expect(res.body.data.users.records[0]).toEqual(
            expect.objectContaining({
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })
        )
    })

    it('uuids', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(user: 
                            { 
                                id: "uuid-user", 
                                email: "faike@email.com", 
                            }
                        ) {
                            id
                            uuid
                        }
                    }`,
            })

        expect(res.body.data.user).toEqual(
            expect.objectContaining({
                uuid: expect.any(String),
            })
        )
    })

    it('date-time', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(user: 
                            { 
                                id: "date-user", 
                                email: "faike@email.com", 
                            }
                        ) {
                            id
                            date
                            dateOnly
                        }
                    }`,
            })

        expect(res.body.data.user).toEqual(
            expect.objectContaining({
                date: expect.any(String),
                dateOnly: expect.any(String),
            })
        )
    })

    it('creates json', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(user: 
                            { 
                                id: "json-user", 
                                address: {
                                    street: "No 10",
                                    postcode: "ECR 2CA",
                                    house: 3
                                }
                            }
                        ) {
                            id
                            address
                        }
                    }`,
            })

        expect(res.body.data.user.address).toMatchInlineSnapshot(`
            Object {
              "house": 3,
              "postcode": "ECR 2CA",
              "street": "No 10",
            }
        `)
    })
})
