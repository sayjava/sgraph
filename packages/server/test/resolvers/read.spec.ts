import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../src/server'
import { Sequelize } from 'sequelize/dist'

describe('List Resolvers', () => {
    let app
    let sequelize: Sequelize

    beforeEach(async () => {
        app = express()
        sequelize = new Sequelize('sqlite::memory:', { logging: true })
        const graphqlHttp = createHTTPGraphql({
            sequelize,
            typeDefs: `
                 type User @model {
                    id: ID @primaryKey 
                    name: String
                    email: String!
                    blocked: Boolean
                    age: Int

                    posts: [Post] @hasMany(foreignKey: "authorId")
                }

                type Post @model {
                    id: String @primaryKey
                    title: String
                    body: String

                    authorId: String!
                    author: User @belongsTo(sourceKey: "authorId")
                }
                `,
        })

        app.use(graphqlHttp)
        await sequelize.sync({
            force: true,
        })

        await sequelize.models.User.bulkCreate([
            {
                id: 'id-1',
                name: 'danlard',
                email: 'user-1@email.com',
                blocked: true,
                age: 20,
            },
            {
                id: 'id-2',
                name: 'maschiko',
                email: 'user-2@email.com',
                blocked: false,
                age: 20,
            },
            {
                id: 'id-3',
                name: 'marseil',
                email: 'user-3@email.com',
                blocked: false,
                age: 20,
            },
        ])

        await sequelize.models.Post.bulkCreate([
            {
                id: 'post-1',
                title: 'Post Title 1',
                body: 'The body of number 1 post',
                authorId: 'id-1',
            },
            {
                id: 'post-2',
                title: 'Post Title 2',
                body: 'The body of number 2 post',
                authorId: 'id-1',
            },
            {
                id: 'post-3',
                title: 'Post Title 3',
                body: 'The body of number 3 post',
                authorId: 'id-2',
            },
            {
                id: 'post-4',
                title: 'Post Title 4',
                body: 'The body of number 4 post',
                authorId: 'id-2',
            },
            {
                id: 'post-5',
                title: 'Post Title 5',
                body: 'The body of number 5 post',
                authorId: 'id-3',
            },
        ])
    })

    describe('Filtering', () => {
        it('basic list filters', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        users: findUsers(where: { name: { startsWith: "dan" } }) {
                            id
                            name
                            posts (limit: 1) {
                                title
                            }
                        }
                    }`,
                })

            expect(res.body.data).toMatchInlineSnapshot(`
                Object {
                  "users": Array [
                    Object {
                      "id": "id-1",
                      "name": "danlard",
                      "posts": Array [
                        Object {
                          "title": "Post Title 1",
                        },
                      ],
                    },
                  ],
                }
            `)
        })
    })
})
