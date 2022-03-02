import request from 'supertest'
import { createServer } from './server'

describe('Validations', () => {
    let app

    beforeAll(async () => {
        const { server } = createServer({
            path: '/',
            database: 'sqlite::memory:',
            schema: `
                type NoCreatePosts @model @crud(create: false) {
                    id: ID @primaryKey
                    email: String
                }

                type NoDeletePosts @model @crud(delete: false) {
                    id: ID @primaryKey
                    email: String
                }

                type NoUpdatePosts @model @crud(update: false) {
                    id: ID @primaryKey
                    email: String
                }

                type NoReadPosts @model @crud(read: false) {
                    id: ID @primaryKey
                    email: String
                }
              `,
        })

        app = server
    })

    it('skips the create mutation', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: create_nocreatepost(input: 
                            { 
                                id: "email", 
                                email: "faike@email.com",
                            }
                        ) {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Cannot query field \\"create_nocreatepost\\" on type \\"Mutation\\". Did you mean \\"create_noreadpost\\", \\"create_noupdatepost\\", \\"create_nodeletepost\\", \\"create_noreadposts\\", or \\"create_noupdateposts\\"?"`
        )
    })

    it('skips the delete mutation', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: delete_nodeletepost_by_pk(id: "some@gmail.com") {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Cannot query field \\"delete_nodeletepost_by_pk\\" on type \\"Mutation\\". Did you mean \\"delete_nocreatepost_by_pk\\", \\"delete_noupdatepost_by_pk\\", \\"update_nodeletepost_by_pk\\", \\"delete_noreadpost_by_pk\\", or \\"update_nocreatepost_by_pk\\"?"`
        )
    })

    it('skips the update mutation', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `mutation {
                        user: update_noupdatepost_by_pk(id: "some@gmail.com") {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Cannot query field \\"update_noupdatepost_by_pk\\" on type \\"Mutation\\". Did you mean \\"update_nocreatepost_by_pk\\", \\"delete_noupdatepost_by_pk\\", \\"update_nodeletepost_by_pk\\", \\"update_noreadpost_by_pk\\", or \\"delete_nocreatepost_by_pk\\"?"`
        )
    })

    it('skips the read query', async () => {
        const res = await request(app)
            .post('/')
            .send({
                query: `query {
                        user: find_noreadpost_by_pk(id: "some@gmail.com") {
                            id
                        }
                    }`,
            })

        expect(res.body.errors[0].message).toMatchInlineSnapshot(
            `"Cannot query field \\"find_noreadpost_by_pk\\" on type \\"Query\\". Did you mean \\"find_nocreatepost_by_pk\\", \\"find_nodeletepost_by_pk\\", \\"find_noupdatepost_by_pk\\", or \\"find_nocreateposts\\"?"`
        )
    })
})
