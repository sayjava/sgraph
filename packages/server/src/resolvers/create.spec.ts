import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Create Resolver', () => {
    let app
    let sequelize: Sequelize

    beforeAll(async () => {
        app = express()
        sequelize = new Sequelize('sqlite::memory:', { logging: false })
        const typeDefs = readFileSync(
            'test/fixtures/users_posts.graphql',
            'utf-8'
        )
        const { users, posts } = JSON.parse(
            readFileSync('test/fixtures/users_posts.json', 'utf-8')
        )
        const graphqlHttp = createHTTPGraphql({
            sequelize,
            typeDefs,
        })

        app.use(graphqlHttp)
        await sequelize.sync({
            force: true,
        })

        await sequelize.models.User.bulkCreate(users)
        await sequelize.models.Post.bulkCreate(posts)
    })

    it('creates a simple model', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(input: 
                            { 
                                id: "new-id", 
                                name: "new-user", 
                                email: "a@b.com", 
                                blocked: false, 
                                age: 19 
                            }
                        ) {
                            id
                            name
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Object {
              "id": "new-id",
              "name": "new-user",
            }
        `)
    })

    it('creates a model with a relationship', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUser(input: 
                            { 
                                id: "another-id", 
                                name: "another-user", 
                                email: "a@b.com", 
                                blocked: false, 
                                age: 19, 
                                posts: [{
                                    id: "new-post-id",
                                    title: "new post title",
                                    body: "a totally new body title",
                                    performance: 10
                                    views: 20
                                }] 
                            }
                        ) {
                            name
                            postsAggregate {
                                count
                                max_views
                            }
                            posts {
                                title
                                authorId
                            }
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Object {
              "name": "another-user",
              "posts": Array [
                Object {
                  "authorId": "another-id",
                  "title": "new post title",
                },
              ],
              "postsAggregate": Object {
                "count": 1,
                "max_views": 20,
              },
            }
        `)
    })

    it('bulk creates records', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: createUsers(inputs: 
                        [
                            { 
                                id: "new-id-1", 
                                name: "new-user", 
                                email: "a@b.com", 
                                blocked: false, 
                                age: 19
                            },
                             { 
                                id: "new-id-2", 
                                name: "new-user", 
                                email: "a@b.com", 
                                blocked: false, 
                                age: 19 
                            }
                        ]
                        ) {
                            id
                            name
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Array [
              Object {
                "id": "new-id-1",
                "name": "new-user",
              },
              Object {
                "id": "new-id-2",
                "name": "new-user",
              },
            ]
        `)
    })
})
