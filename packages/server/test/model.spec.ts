import { SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { createMemory } from '../src/init'
import { mapTypesToModel } from '../src/models'

describe('Models', () => {
    describe('@models directives', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          id: ID @primaryKey 
          name: String
        }

        type Comment @model(tableName: "comments") {
          id: ID @primaryKey 
          name: String
        }

        type Post {
          id: ID
          title: String
        }
      `
        )

        mapTypesToModel({ composer, sequelize })

        it('does not create a Post model', () => {
            expect(sequelize.models.Post).toBe(undefined)
        })

        it('creates a User model', () => {
            expect(sequelize.models.User).not.toBe(undefined)
        })

        it('creates comments', () => {
            expect(sequelize.models.User).not.toBe(undefined)
        })
    })

    describe('Validation', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          email: String
          name: String
        }
      `
        )

        it('validates no unique', () => {
            expect(() => mapTypesToModel({ composer, sequelize })).toThrow(
                'User has no unique fields'
            )
        })
    })

    describe('attributes', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          id: ID @primaryKey 
          name: String
          email: String!
          blocked: Boolean
          age: Int
          hobbies: [String!]
        }

      `
        )

        mapTypesToModel({ composer, sequelize })

        it('generates attributes', () => {
            expect(sequelize.models.User.getAttributes())
                .toMatchInlineSnapshot(`
                Object {
                  "age": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "age",
                    "fieldName": "age",
                    "primaryKey": false,
                    "type": "Int",
                  },
                  "blocked": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "blocked",
                    "fieldName": "blocked",
                    "primaryKey": false,
                    "type": "Boolean",
                  },
                  "email": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": false,
                    "field": "email",
                    "fieldName": "email",
                    "primaryKey": false,
                    "type": "String",
                  },
                  "hobbies": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "hobbies",
                    "fieldName": "hobbies",
                    "primaryKey": false,
                    "type": "String",
                  },
                  "id": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "id",
                    "fieldName": "id",
                    "primaryKey": true,
                    "type": "ID",
                  },
                  "name": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "name",
                    "fieldName": "name",
                    "primaryKey": false,
                    "type": "String",
                  },
                }
            `)
        })
    })
})
