import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const fileTypes = v.union(
  v.literal('image'),
  v.literal('csv'),
  v.literal('txt'),
  v.literal('pdf')
)

export const roles = v.union(v.literal('admin'), v.literal('member'))

export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    orgId: v.string(),
    fileId: v.id('_storage'),
    markedAsDeleted: v.optional(v.boolean()),
  })
    .index('by_orgId', ['orgId'])
    .index('by_markedAsDeleted', ['markedAsDeleted']),
  favorites: defineTable({
    fileId: v.id('files'),
    orgId: v.string(),
    userId: v.id('users'),
  }).index('by_userId_orgId_fileId', ['userId', 'orgId', 'fileId']),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(
      v.object({
        orgId: v.string(),
        role: roles,
      })
    ),
  }).index('by_tokenIndentifier', ['tokenIdentifier']),
})
