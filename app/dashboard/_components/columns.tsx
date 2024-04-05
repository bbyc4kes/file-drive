'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { ColumnDef } from '@tanstack/react-table'
import { useQuery } from 'convex/react'
import { formatRelative } from 'date-fns'
import { FileCardActions } from './file-actions'

function UserCell({ userId }: { userId: Id<'users'> }) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId,
  })

  return (
    <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
      <Avatar className="w-6 h-6">
        <AvatarImage src={userProfile?.image} />
        <AvatarFallback>
          {userProfile?.name
            ?.split(' ')
            .map((word) => word[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div>{userProfile?.name}</div>
    </div>
  )
}

export const columns: ColumnDef<
  Doc<'files'> & { isFavorited: boolean; url: string | null }
>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    header: 'User',
    cell: ({ row }) => {
      return <UserCell userId={row.original.userId} />
    },
  },
  {
    header: 'Updated On',
    cell: ({ row }) => {
      return (
        <div>
          {formatRelative(new Date(row.original._creationTime), new Date())}
        </div>
      )
    },
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div>
          <FileCardActions
            file={row.original}
            isFavorited={row.original.isFavorited}
          />
        </div>
      )
    },
  },
]
