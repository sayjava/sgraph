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
                        response: deleteUsers(where: { id: { eq: "id-1" } }) {
                           affected
                        }
                    }`,
            })

        expect(res.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 1,
            }
        `)
    })

    it.skip('simple record update', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                        response: findPosts(where: { authorId: { eq: "id-1" } }) {
                           title
                           author {
                               id
                           }
                        }
                    }`,
            })

        console.log(res.body)

        expect(res.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 1,
            }
        `)
    })
})
