import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../server'
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

    it('simple record update', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: updateUser(user: 
                            {  
                                age: 34 
                            },
                        where: { age: { eq: 10 } }
                        ) {
                            id
                            age
                            posts {
                                title,
                                views
                            },
                            postsAggregate {
                                max_views
                            }
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Array [
              Object {
                "age": 34,
                "id": "id-1",
                "posts": Array [
                  Object {
                    "title": "Post Title 1",
                    "views": 1234,
                  },
                  Object {
                    "title": "Post Title 2",
                    "views": 3345,
                  },
                ],
                "postsAggregate": Object {
                  "max_views": 3345,
                },
              },
            ]
        `)
    })

    it('update non-existing record', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: updateUser(user: 
                            {  
                                age: 34 
                            },
                        where: { age: { eq: 12 } }
                        ) {
                            id
                            age
                            posts {
                                title,
                                views
                            },
                            postsAggregate {
                                max_views
                            }
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`Array []`)
    })

    it('updates multiple record', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: updateUser(user: 
                            {  
                                age: 34 
                            },
                        where: { age: { lt: 20 } }
                        ) {
                            id
                            age
                            postsAggregate {
                                max_views
                            }
                        }
                    }`,
            })

        expect(res.body.data.user).toMatchInlineSnapshot(`
            Array [
              Object {
                "age": 34,
                "id": "id-1",
                "postsAggregate": Object {
                  "max_views": 3345,
                },
              },
              Object {
                "age": 34,
                "id": "id-2",
                "postsAggregate": Object {
                  "max_views": 56735,
                },
              },
            ]
        `)
    })
})
