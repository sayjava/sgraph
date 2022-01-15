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

    describe('field', () => {
        it('sums', async () => {
            const res = await request(app)
                .post('/')
                .send({
                    query: `query {
                        posts: postsAggregate(where: { views: { gt: 4000 } }) {
                            count
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
                }
            `)
        })
    })
})
