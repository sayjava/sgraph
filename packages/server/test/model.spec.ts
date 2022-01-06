import { createMemory } from '../src/init'
import { createTypeModels } from '../src/models'

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

        createTypeModels({ composer, sequelize })

        it('does not create a Post model', () => {
            expect(sequelize.models.Post).toBe(undefined)
        })

        it('creates a User model', () => {
            expect(sequelize.models.User).not.toBe(undefined)
        })

        it('creates comments', () => {
            expect(sequelize.models.User).not.toBe(undefined)
        })

        it('uses table name from the directive', () => {
            expect(sequelize.models.Comment.tableName).toEqual('comments')
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
            expect(() => createTypeModels({ composer, sequelize })).toThrow(
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
          locationPlace: String @column(name: "location_place")
        }

      `
        )

        createTypeModels({ composer, sequelize })

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
                    "unique": false,
                  },
                  "blocked": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "blocked",
                    "fieldName": "blocked",
                    "primaryKey": false,
                    "type": "Boolean",
                    "unique": false,
                  },
                  "email": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": false,
                    "field": "email",
                    "fieldName": "email",
                    "primaryKey": false,
                    "type": "String",
                    "unique": false,
                  },
                  "hobbies": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "hobbies",
                    "fieldName": "hobbies",
                    "primaryKey": false,
                    "type": "String",
                    "unique": false,
                  },
                  "id": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "id",
                    "fieldName": "id",
                    "primaryKey": true,
                    "type": "ID",
                    "unique": false,
                  },
                  "locationPlace": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "location_place",
                    "fieldName": "locationPlace",
                    "primaryKey": false,
                    "type": "String",
                    "unique": false,
                  },
                  "name": Object {
                    "Model": [Function],
                    "_modelAttribute": true,
                    "allowNull": true,
                    "field": "name",
                    "fieldName": "name",
                    "primaryKey": false,
                    "type": "String",
                    "unique": false,
                  },
                }
            `)
        })
    })
})
