import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../src/server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Aggregate', () => {
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
        await sequelize.sync({ force: true })

        await sequelize.models.User.bulkCreate(users)
        await sequelize.models.Post.bulkCreate(posts)
    })

    describe('fieldd', () => {
        it('sums, avg, min, max, sum, count', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        posts: postsAggregate(where: { views: { gt: 4000 } }) {
                            count
                            total_views
                            avg_views
                            min_views
                            sum_views
                            max_views
                        }
                    }`,
                })

            expect(res.body.data.posts).toMatchInlineSnapshot(`
                Object {
                  "avg_views": 32709.5,
                  "count": 2,
                  "max_views": 56735,
                  "min_views": 8684,
                  "sum_views": 65419,
                  "total_views": 65419,
                }
            `)
        })

        it('fetches relationship aggregate', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        authors: findUsers(where: { id: { eq:"id-1" } }) {
                            name
                            postsAggregate {
                                count
                                avg_views
                                min_views
                                sum_views
                                max_views
                            }
                        }
                    }`,
                })

            expect(res.body.data.authors).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "name": "danlard",
                    "postsAggregate": Object {
                      "avg_views": 2289.5,
                      "count": 2,
                      "max_views": 3345,
                      "min_views": 1234,
                      "sum_views": 4579,
                    },
                  },
                ]
            `)
        })

        it('fetches relationship aggregate with filter', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        authors: findUsers(where: { id: { eq:"id-1" } }) {
                            name
                            postsAggregate {
                                count
                                avg_views
                                min_views
                                sum_views
                                max_views
                            }
                        }
                    }`,
                })

            expect(res.body.data.authors).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "name": "danlard",
                    "postsAggregate": Object {
                      "avg_views": 2289.5,
                      "count": 2,
                      "max_views": 3345,
                      "min_views": 1234,
                      "sum_views": 4579,
                    },
                  },
                ]
            `)
        })

        it('fetches relationship aggregate with filter', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        authors: findUsers(where: { id: { eq:"id-2" } }) {
                            name
                            postsAggregate(where: { performance: { gt: 10 } }) {
                                count
                                avg_views
                                min_views
                                sum_views
                                max_views
                            }
                        }
                    }`,
                })

            expect(res.body.data.authors).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "name": "maschiko",
                    "postsAggregate": Object {
                      "avg_views": 56735,
                      "count": 1,
                      "max_views": 56735,
                      "min_views": 56735,
                      "sum_views": 56735,
                    },
                  },
                ]
            `)
        })

        it('pk with aggregates', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        authors: userByPk(id: "id-2") {
                            name
                            postsAggregate(where: { performance: { lt: 10 } }) {
                                count
                                avg_views
                                min_views
                                sum_views
                                max_views
                            }
                        }
                    }`,
                })

            expect(res.body.data.authors).toMatchInlineSnapshot(`
                Object {
                  "name": "maschiko",
                  "postsAggregate": Object {
                    "avg_views": 8684,
                    "count": 1,
                    "max_views": 8684,
                    "min_views": 8684,
                    "sum_views": 8684,
                  },
                }
            `)
        })
    })
})
