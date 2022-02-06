import request from 'supertest'
import { createTestServer } from './server'

describe('Validations', () => {
    let app

    beforeAll(async () => {
        app = createTestServer({
            database: 'sqlite::memory:',
            schema: `
                type User @model @autoTimestamp {
                    id: ID @primaryKey
                    email: String @validate_isEmail
                    queue: Int @autoIncrement
                    uuid1: String @uuidv1
                    uuid4: String @uuidv4
                    date: String @dateTime
                    dateOnly: String @date
                }
              `,
        })
    })

    it('autoincrement', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
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
                        user: create_user(input: 
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
                        users: update_users(input: 
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
                        user: create_user(input: 
                            { 
                                id: "uuid-user", 
                                email: "faike@email.com", 
                            }
                        ) {
                            id
                            uuid1
                            uuid4
                        }
                    }`,
            })

        expect(res.body.data.user).toEqual(
            expect.objectContaining({
                uuid1: expect.any(String),
                uuid4: expect.any(String),
            })
        )
    })

    it('date-time', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_user(input: 
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
})
