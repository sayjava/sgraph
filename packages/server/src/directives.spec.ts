import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from './server'
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

        app.use(graphqlHttp)
        await sequelize.sync({ force: true })
    })

    it('autoincrement', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com", 
                            }
                        ) {
                            id
                            queue
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Object {
              "id": "email",
              "queue": 1,
            }
        `)
    })

    it('timestamps', async () => {
        await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(input: 
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
                        user: createUser(input: 
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
                        user: createUser(input: 
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
