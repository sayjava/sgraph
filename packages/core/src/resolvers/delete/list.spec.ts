import request from 'supertest'
import { createServer } from '../../server'

describe('Delete Resolver', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            schema: './jest/schema.graphql',
            database: 'sqlite:jest/database.sqlite',
        })
        app = server
    })

    it('delete an order, deletes details', async () => {
        const name = 'Produce'
        const deleteRes = await request(app)
            .post('/')
            .send({
                query: `
                    mutation($name: String) {
                        response: delete_categories(where: { CategoryName: { like: $name } }) {
                           affected
                        }
                    }`,
                variables: {
                    name,
                },
            })

        expect(deleteRes.body.data.response).toMatchInlineSnapshot(`
            Object {
              "affected": 1,
            }
        `)
    })
})
