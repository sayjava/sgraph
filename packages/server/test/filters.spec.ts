import { SchemaComposer } from 'graphql-compose'
import { Sequelize } from 'sequelize'
import { createMemory } from '../src/init'
import { createInputFilters } from '../src/filters'
import { createTypeModels } from '../src/models'

describe('Filters', () => {
    describe('String', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          id: ID @primaryKey 
          name: String
          email: String!
          tags: [String!]
        }
      `
        )

        createTypeModels({ composer, sequelize })
        createInputFilters({ composer, sequelize })

        it('creates string filters', () => {
            expect(composer.getITC('UserFilter')).toBeTruthy()
        })

        it('creates basic filters', () => {
            expect(composer.getITC('BasicFilter').toSDL())
                .toMatchInlineSnapshot(`
                "input BasicFilter {
                  \\"\\"\\"Equal to\\"\\"\\"
                  eq: String

                  \\"\\"\\"Not equal to\\"\\"\\"
                  ne: String

                  \\"\\"\\"Is the same as\\"\\"\\"
                  is: String

                  \\"\\"\\"Not same as\\"\\"\\"
                  not: String

                  \\"\\"\\"Either value\\"\\"\\"
                  or: [String!]
                }"
            `)
        })

        it('creates boolean filters', () => {
            expect(composer.getITC('BooleanFilter').toSDL())
                .toMatchInlineSnapshot(`
                "input BooleanFilter {
                  \\"\\"\\"Equal to\\"\\"\\"
                  eq: Boolean

                  \\"\\"\\"Not equal to\\"\\"\\"
                  ne: Boolean

                  \\"\\"\\"Is the same as\\"\\"\\"
                  is: Boolean

                  \\"\\"\\"Not same as\\"\\"\\"
                  not: Boolean

                  \\"\\"\\"Either value\\"\\"\\"
                  or: [Boolean!]
                }"
            `)
        })

        it('creates number filters', () => {
            expect(composer.getITC('IntFilter').toSDL()).toMatchInlineSnapshot(`
                "input IntFilter {
                  \\"\\"\\"Greater than\\"\\"\\"
                  gt: Int

                  \\"\\"\\"Greater than or equal to\\"\\"\\"
                  gte: Int

                  \\"\\"\\"Less than\\"\\"\\"
                  lt: Int

                  \\"\\"\\"Less than or equal to\\"\\"\\"
                  lte: Int

                  \\"\\"\\"Is between\\"\\"\\"
                  between: [Int!]

                  \\"\\"\\"Is not between\\"\\"\\"
                  notBetween: [Int!]

                  \\"\\"\\"Equal to\\"\\"\\"
                  eq: Int

                  \\"\\"\\"Not equal to\\"\\"\\"
                  ne: Int

                  \\"\\"\\"Is the same as\\"\\"\\"
                  is: Int

                  \\"\\"\\"Not same as\\"\\"\\"
                  not: Int

                  \\"\\"\\"Either value\\"\\"\\"
                  or: [Int!]
                }"
            `)
        })

        it('generates spring filter', () => {
            expect(composer.getITC('StringFilter').toSDL())
                .toMatchInlineSnapshot(`
                "input StringFilter {
                  \\"\\"\\"like\\"\\"\\"
                  like: String

                  \\"\\"\\"not like\\"\\"\\"
                  notLike: String

                  \\"\\"\\"starts with\\"\\"\\"
                  startsWith: String

                  \\"\\"\\"ends with\\"\\"\\"
                  endsWith: String

                  \\"\\"\\"substring\\"\\"\\"
                  substring: String

                  \\"\\"\\"Equal to\\"\\"\\"
                  eq: String

                  \\"\\"\\"Not equal to\\"\\"\\"
                  ne: String

                  \\"\\"\\"Is the same as\\"\\"\\"
                  is: String

                  \\"\\"\\"Not same as\\"\\"\\"
                  not: String

                  \\"\\"\\"Either value\\"\\"\\"
                  or: [String!]
                }"
            `)
        })

        it('lists user fields', () => {
            expect(composer.getITC('UserFilter').toSDL())
                .toMatchInlineSnapshot(`
                "input UserFilter {
                  \\"\\"\\"Filter for id\\"\\"\\"
                  id: StringFilter

                  \\"\\"\\"Filter for name\\"\\"\\"
                  name: StringFilter

                  \\"\\"\\"Filter for email\\"\\"\\"
                  email: StringFilter

                  \\"\\"\\"Filter for tags\\"\\"\\"
                  tags: StringFilter
                }"
            `)
        })
    })

    describe('Int', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          id: ID @primaryKey 
          age: Int
          coords: [Float!]!
        }
      `
        )

        createTypeModels({ composer, sequelize })
        createInputFilters({ composer, sequelize })

        it('creates int filters', () => {
            expect(composer.getITC('UserFilter').toSDL())
                .toMatchInlineSnapshot(`
                "input UserFilter {
                  \\"\\"\\"Filter for id\\"\\"\\"
                  id: StringFilter

                  \\"\\"\\"Filter for age\\"\\"\\"
                  age: IntFilter

                  \\"\\"\\"Filter for coords\\"\\"\\"
                  coords: FloatFilter
                }"
            `)
        })
    })

    describe('Boolean', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          id: ID @primaryKey 
          blocked: Boolean
        }
      `
        )

        createTypeModels({ composer, sequelize })
        createInputFilters({ composer, sequelize })

        it('creates int filters', () => {
            expect(composer.getITC('UserFilter').toSDL())
                .toMatchInlineSnapshot(`
                "input UserFilter {
                  \\"\\"\\"Filter for id\\"\\"\\"
                  id: StringFilter

                  \\"\\"\\"Filter for blocked\\"\\"\\"
                  blocked: BooleanFilter
                }"
            `)
        })
    })
})
