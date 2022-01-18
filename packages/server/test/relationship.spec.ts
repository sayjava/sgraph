import { createInputFilters } from '../src/filters'
import { createMemory } from '../src/init'
import { createTypeModels } from '../src/models'
import { createOder } from '../src/order'
import { createRelationships } from '../src/relationships'
import { getModelTypes } from '../src/utils'

describe('Relationships', () => {
    let user
    const { composer, sequelize } = createMemory(
        `
        type User @model {
            id: String @primaryKey 
            name: String
        
            profile: Profile @hasOne(foreignKey: "userId")
            comments: [Comment] @hasMany(foreignKey: "authorId")
            
            likedComments: [Comment] @belongsToMany(through: "CommentLike")
        }

        type Profile @model {
            profileId: ID @primaryKey
            userName: String
            userId: String! 
        }

        type Comment @model(tableName: "comments") {
            id: String @primaryKey 
            title: String
            authorId: String

            author: User @belongsTo(sourceKey: "authorId")
        }

        type CommentLike @model {
            """ Sequelize Wants the ID to be in this format """
            CommentId: String! @primaryKey @column(name: "commentId" )
            UserId: String! @primaryKey @column(name: "userId" )
        }
      `
    )

    beforeAll(async () => {
        const types = getModelTypes(composer)
        createTypeModels({ types, sequelize })
        createOder({ types, sequelize })
        createInputFilters({ types, sequelize })
        createRelationships({ types, sequelize })
        await sequelize.sync()

        user = await sequelize.models.User.create(
            {
                id: 'an-id',
                name: 'test-user',
                profile: {
                    profileId: 'a-profile-id',
                    userName: 'sample-user',
                    userId: 'an-id',
                },
                comments: [
                    {
                        id: 'comment-id',
                        title: 'new comment',
                        authorId: 'an-id',
                    },
                    {
                        id: 'comment-id-2',
                        title: 'new comment 2',
                        authorId: 'an-id',
                    },
                ],
            },
            {
                include: [
                    { model: sequelize.models.Comment, as: 'comments' },
                    { model: sequelize.models.Profile, as: 'profile' },
                ],
            }
        )

        await sequelize.models.User.create(
            {
                id: 'an-id-2',
                name: 'user-2',
                comments: [
                    {
                        id: 'comment-id-3',
                        title: 'new comment 3',
                        authorId: 'an-id-2',
                    },
                ],
            },
            {
                include: [{ model: sequelize.models.Comment, as: 'comments' }],
            }
        )

        await sequelize.models.CommentLike.bulkCreate([
            {
                CommentId: 'comment-id',
                UserId: 'an-id',
            },
            {
                CommentId: 'comment-id-2',
                UserId: 'an-id',
            },
            {
                CommentId: 'comment-id-3',
                UserId: 'an-id-2',
            },
        ])
    })

    it('hasMany', async () => {
        // @ts-ignore
        const [cmt] = await user.getComments()
        expect(cmt).not.toBe(undefined)
    })

    it('belongsTo', async () => {
        const cmt = await sequelize.models.Comment.findByPk('comment-id', {
            include: ['author'],
        })

        expect(cmt.toJSON().author).toMatchInlineSnapshot(`
                Object {
                  "id": "an-id",
                  "name": "test-user",
                }
            `)
    })

    it('hasOne', async () => {
        const user = await sequelize.models.User.findByPk('an-id', {
            include: ['profile'],
        })

        expect(user.toJSON().profile).toMatchInlineSnapshot(`
                Object {
                  "profileId": "a-profile-id",
                  "userId": "an-id",
                  "userName": "sample-user",
                }
            `)
    })

    it('belongsToMany', async () => {
        const user = await sequelize.models.User.findByPk('an-id', {
            include: ['likedComments'],
        })

        expect(user.toJSON().likedComments).toMatchInlineSnapshot(`
            Array [
              Object {
                "CommentLike": Object {
                  "CommentId": "comment-id",
                  "UserId": "an-id",
                },
                "authorId": "an-id",
                "id": "comment-id",
                "title": "new comment",
              },
              Object {
                "CommentLike": Object {
                  "CommentId": "comment-id-2",
                  "UserId": "an-id",
                },
                "authorId": "an-id",
                "id": "comment-id-2",
                "title": "new comment 2",
              },
            ]
        `)
    })
})
