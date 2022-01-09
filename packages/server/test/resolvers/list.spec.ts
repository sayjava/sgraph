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
                age: 10,
            },
            {
                id: 'id-2',
                name: 'maschiko',
                email: 'user-2@email.com',
                blocked: false,
                age: 15,
            },
            {
                id: 'id-3',
                name: 'marseil',
                email: 'user-3@email.com',
                blocked: false,
                age: 25,
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
        describe('Basic', () => {
            it('eq', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { eq: "maschiko" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-2",
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('ne', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { ne: "maschiko" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                      Object {
                        "id": "id-3",
                        "name": "marseil",
                      },
                    ]
                `)
            })

            it('is', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { is: "maschiko" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-2",
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('or', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { or: ["maschiko", "danlard"] } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                      Object {
                        "id": "id-2",
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('startsWith', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { startsWith: "dan" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                    ]
                `)
            })

            it('combined or', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers( where: {
                            or: [{ name: { substring: "nla" } }, { name: { substring: "chi" } }]
                        } ) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                      Object {
                        "id": "id-2",
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('combined or', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers( where: {
                            and: [{ name: { substring: "nla" } }, { name: { substring: "chi" } }]
                        } ) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`Array []`)
            })
        })

        describe('String', () => {
            it('like', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { like: "maschiko" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-2",
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('not like', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { notLike: "maschiko" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                      Object {
                        "id": "id-3",
                        "name": "marseil",
                      },
                    ]
                `)
            })

            it('startsWith', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { startsWith: "dan" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                    ]
                `)
            })

            it('endsWith', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { endsWith: "lard" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                    ]
                `)
            })

            it('substring', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { name: { substring: "nla" } }) {
                            id
                            name
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "id": "id-1",
                        "name": "danlard",
                      },
                    ]
                `)
            })
        })

        describe('Int', () => {
            it('gt', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { age: { gt: 20 } }) {
                            name
                            age
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "age": 25,
                        "name": "marseil",
                      },
                    ]
                `)
            })

            it('gte', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { age: { gte: 25 } }) {
                            name
                            age
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "age": 25,
                        "name": "marseil",
                      },
                    ]
                `)
            })

            it('lt', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { age: { lt: 15 } }) {
                            name
                            age
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "age": 10,
                        "name": "danlard",
                      },
                    ]
                `)
            })

            it('lte', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { age: { lte: 10 } }) {
                            name
                            age
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "age": 10,
                        "name": "danlard",
                      },
                    ]
                `)
            })

            it('between', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { age: { between: [10, 15] } }) {
                            name
                            age
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "age": 10,
                        "name": "danlard",
                      },
                      Object {
                        "age": 15,
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('notbetween', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { age: { notBetween: [10, 15] } }) {
                            name
                            age
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "age": 25,
                        "name": "marseil",
                      },
                    ]
                `)
            })
        })

        describe('Boolean', () => {
            it('eq', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers(where: { blocked: { eq: true } }) {
                            name
                            blocked
                        }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "blocked": true,
                        "name": "danlard",
                      },
                    ]
                `)
            })
        })
    })

    describe('Relationships', () => {
        it('basic', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        users: findUsers(where: { name: { eq: "maschiko" } }) {
                            id
                            name
                            posts (limit: 1) {
                                title
                            }
                         }
                    }`,
                })

            expect(res.body.data.users).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "id": "id-2",
                    "name": "maschiko",
                    "posts": Array [
                      Object {
                        "title": "Post Title 1",
                      },
                    ],
                  },
                ]
            `)
        })

        it('filter', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        users: findUsers(where: { name: { eq: "maschiko" } }) {
                            id
                            name
                            posts ( where: { body: { endsWith: "2 post" } }) {
                                title
                            }
                         }
                    }`,
                })

            expect(res.body.data.users).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "id": "id-2",
                    "name": "maschiko",
                    "posts": Array [
                      Object {
                        "title": "Post Title 2",
                      },
                    ],
                  },
                ]
            `)
        })
    })

    describe.only('Order', () => {
        describe('Basic', () => {
            it('order by asc', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers( order: { name: ASC } ) {
                            name
                         }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "name": "danlard",
                      },
                      Object {
                        "name": "marseil",
                      },
                      Object {
                        "name": "maschiko",
                      },
                    ]
                `)
            })

            it('order by desc', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers( order: { name: DESC } ) {
                            name
                         }
                    }`,
                    })

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "name": "maschiko",
                      },
                      Object {
                        "name": "marseil",
                      },
                      Object {
                        "name": "danlard",
                      },
                    ]
                `)
            })

            it.skip('order by aggregate desc', async () => {
                const res = await request(app)
                    .post('/')
                    .send({
                        query: `query {
                        users: findUsers( order: { min_age: DESC } ) {
                            name
                            age
                         }
                    }`,
                    })

                console.log(res.body.errors)

                expect(res.body.data.users).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "name": "maschiko",
                      },
                      Object {
                        "name": "marseil",
                      },
                      Object {
                        "name": "danlard",
                      },
                    ]
                `)
            })
        })
    })
})
