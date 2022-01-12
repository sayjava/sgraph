import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../src/server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('PK Resolver', () => {
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

    describe('Single', () => {
        it('should find a user by id', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        user: userByPk(id: "id-1") {
                            id
                            name
                        }
                    }`,
                })

            expect(res.body.data.user).toMatchInlineSnapshot(`
                            Object {
                              "id": "id-1",
                              "name": "danlard",
                            }
                    `)
        })

        it('should not return a valid user', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        user: userByPk(id: 2) {
                            id
                            name
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
                                "message": "No User found with id 2",
                                "path": Array [
                                  "user",
                                ],
                              },
                            ]
                    `)
        })
    })

    describe('Relationship', () => {
        it('on-to-many', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        user: userByPk(id: "id-1") {
                          id
                          name
                          posts ( where: { body: { endsWith: "2 post" } }) {
                            title
                          }
                        }
                    }`,
                })

            expect(res.body.data.user).toMatchInlineSnapshot(`
                Object {
                  "id": "id-1",
                  "name": "danlard",
                  "posts": Array [
                    Object {
                      "title": "Post Title 2",
                    },
                  ],
                }
            `)
        })

        it('on-to-one', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        post: postByPk(id: "post-4") {
                          id
                          title
                          author {
                            name
                          }
                        }
                    }`,
                })

            expect(res.body.data.post).toMatchInlineSnapshot(`
                Object {
                  "author": Object {
                    "name": "maschiko",
                  },
                  "id": "post-4",
                  "title": "Post Title 4",
                }
            `)
        })
    })
})
