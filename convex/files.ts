import { ConvexError, v } from 'convex/values'
import { MutationCtx, QueryCtx, mutation, query } from './_generated/server'
import { getUser } from './users'
import { fileTypes } from './schema'

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier)

  if (!user) {
    return null
  }

  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId)

  if (!hasAccess) {
    return null
  }

  return hasAccess
}

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new ConvexError('You have to be logged in to perform this action!')
  }

  return await ctx.storage.generateUploadUrl()
})

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id('_storage'),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new ConvexError('You have to be logged in to perform this action!')
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    )

    if (!hasAccess) {
      throw new ConvexError('You do not have access to perform this action.')
    }

    await ctx.db.insert('files', {
      name: args.name,
      fileId: args.fileId,
      orgId: args.orgId,
      type: args.type,
    })
  },
})

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return null
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    )

    if (!hasAccess) {
      return []
    }

    let files = await ctx.db
      .query('files')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect()

    const filesWithUrl = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    )

    return filesWithUrl
  },
})

export const deleteFile = mutation({
  args: { fileId: v.id('files') },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new ConvexError('You have to be logged in to perform this action!')
    }

    const file = await ctx.db.get(args.fileId)

    if (!file) {
      throw new ConvexError(`This file doesn't exist!`)
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    )

    if (!hasAccess) {
      throw new ConvexError('You do not have access to perform this action.')
    }

    await ctx.db.delete(args.fileId)
  },
})
