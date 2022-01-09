import { createMemory } from '../src/init'
import { createOder } from '../src/order'

describe('Order', () => {
    describe('Basic', () => {
        const { composer, sequelize } = createMemory(
            `
        type User @model {
          id: ID @primaryKey
          age: Int
          height: Float! 
          name: String
          email: String!
          tags: [String!]
        }
      `
        )

        createOder({ composer, sequelize })

        it('creates a basic order by enum', () => {
            expect(composer.getITC('UserOrderBy').toSDL())
                .toMatchInlineSnapshot(`
                "input UserOrderBy {
                  id: OrderBy
                  age: OrderBy
                  height: OrderBy
                  name: OrderBy
                  email: OrderBy
                  tags: OrderBy
                }"
            `)
        })
    })
})
