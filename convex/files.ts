import { ConvexError, v } from 'convex/values'
import { MutationCtx, QueryCtx, mutation, query } from './_generated/server'
import { getUser } from './users'

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier)

  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId)

  if (!hasAccess) {
    throw new ConvexError('You do not have access to perform this action.')
  }

  return hasAccess
}

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
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

    console.log(identity.tokenIdentifier)

    if (!hasAccess) {
      throw new ConvexError('You do not have access to perform this action.')
    }

    await ctx.db.insert('files', {
      name: args.name,
      orgId: args.orgId,
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

    return ctx.db
      .query('files')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect()
  },
})
