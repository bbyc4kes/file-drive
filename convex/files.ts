import { ConvexError, v } from 'convex/values'
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from './_generated/server'
import { fileTypes } from './schema'
import { Doc, Id } from './_generated/dataModel'

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    return null
  }
  const user = await ctx.db
    .query('users')
    .withIndex('by_tokenIndentifier', (q) =>
      q.eq('tokenIdentifier', identity.tokenIdentifier)
    )
    .first()

  if (!user) {
    return null
  }

  const hasAccess =
    user.orgIds.some((items) => items.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId)

  if (!hasAccess) {
    return null
  }

  return { user }
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
    const hasAccess = await hasAccessToOrg(ctx, args.orgId)

    if (!hasAccess) {
      throw new ConvexError('You do not have access to perform this action.')
    }

    await ctx.db.insert('files', {
      name: args.name,
      fileId: args.fileId,
      orgId: args.orgId,
      userId: hasAccess.user._id,
      type: args.type,
    })
  },
})

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deleteOnly: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId)

    if (!hasAccess) {
      return []
    }

    let files = await ctx.db
      .query('files')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect()

    const query = args.query

    if (query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    let filesWithUrl = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    )

    if (args.favorites) {
      const favorites = await ctx.db
        .query('favorites')
        .withIndex('by_userId_orgId_fileId', (q) =>
          q.eq('userId', hasAccess.user._id).eq('orgId', args.orgId)
        )
        .collect()

      filesWithUrl = filesWithUrl.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      )
    }

    if (args.deleteOnly) {
      filesWithUrl = filesWithUrl.filter((file) => file.markedAsDeleted)
    } else {
      filesWithUrl = filesWithUrl.filter((file) => !file.markedAsDeleted)
    }

    return filesWithUrl
  },
})

// function assertCanDeleteFile(user: Doc<'users'>, file: Doc<'files'>) {
//   const canDelete =
//     file.userId === user._id ||
//     user.orgIds.find((org) => org.orgId === file.orgId)?.role === 'admin'

//   if (!canDelete) {
//     throw new ConvexError('you have no acces to delete this file')
//   }
// }

export const restoreFile = mutation({
  args: { fileId: v.id('files') },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId)

    if (!access) {
      throw new ConvexError('no access to file')
    }

    const isAdmin =
      access.user.orgIds.find((org) => org.orgId === access.file.orgId)
        ?.role === 'admin'

    if (!isAdmin) {
      throw new ConvexError('You have to be an admin to perform this action.')
    }
    await ctx.db.patch(args.fileId, {
      markedAsDeleted: false,
    })
  },
})

export const deleteAllFiles = internalMutation({
  args: {},
  async handler(ctx) {
    const files = await ctx.db
      .query('files')
      .withIndex('by_markedAsDeleted', (q) => q.eq('markedAsDeleted', true))
      .collect()

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId)
        return await ctx.db.delete(file._id)
      })
    )
  },
})

export const deleteFile = mutation({
  args: { fileId: v.id('files') },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId)

    if (!access) {
      throw new ConvexError(`You don't have access to perform this action.`)
    }

    const isAdmin =
      access.user.orgIds.find((org) => org.orgId === access.file.orgId)
        ?.role === 'admin'

    if (!isAdmin) {
      throw new ConvexError('You have to be an admin to perform this action.')
    }

    await ctx.db.patch(args.fileId, {
      markedAsDeleted: true,
    })
  },
})

export const toggleFavorite = mutation({
  args: { fileId: v.id('files') },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId)

    if (!access) {
      throw new ConvexError(`You don't have access to perform this action.`)
    }

    const favorite = await ctx.db
      .query('favorites')
      .withIndex('by_userId_orgId_fileId', (q) =>
        q
          .eq('userId', access.user._id)
          .eq('orgId', access.file.orgId)
          .eq('fileId', access.file._id)
      )
      .first()

    if (!favorite) {
      await ctx.db.insert('favorites', {
        fileId: access.file._id,
        userId: access.user._id,
        orgId: access.file.orgId,
      })
    } else {
      await ctx.db.delete(favorite._id)
    }
  },
})

export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId)

    if (!hasAccess) {
      return null
    }

    const favorites = await ctx.db
      .query('favorites')
      .withIndex('by_userId_orgId_fileId', (q) =>
        q.eq('userId', hasAccess.user._id).eq('orgId', args.orgId)
      )
      .collect()

    return favorites
  },
})

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<'files'>
) {
  const file = await ctx.db.get(fileId)

  if (!file) {
    return null
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId)

  if (!hasAccess) {
    return null
  }

  return { user: hasAccess.user, file }
}
