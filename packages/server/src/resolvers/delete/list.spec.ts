import request from 'supertest'
import express from 'express'
import { createHTTPGraphql } from '../../server'
import { Sequelize } from 'sequelize'
import { readFileSync } from 'fs'

describe('Delete Resolver', () => {
    let app
    let sequelize: Sequelize

    beforeAll(async () => {
        app = express()
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './test/fixtures/northwind.sqlite',
            logging: false,
        })
        const typeDefs = readFileSync(
            './test/fixtures/northwind.graphql',
            'utf-8'
        )

        const graphqlHttp = createHTTPGraphql({
            sequelize,
            typeDefs,
        })

        app.use(graphqlHttp)
    })

    it('delete an order, deletes details', async () => {
        const freight = 400
        const deleteRes = await request(app)
            .post('/')
            .send({
                query: `
                    mutation($freight: Float) {
                        response: delete_orders(where: { Freight: { gte: $freight } }) {
                           affected
                        }
                    }`,
                variables: {
                    freight,
                },
            })

        expect(deleteRes.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 3310,
            }
        `)
    })
})
