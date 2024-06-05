'use client'

import { api } from '@/convex/_generated/api'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'

import UploadButton from './upload-button'
import { FileCard } from './file-card'
import Image from 'next/image'
import { GridIcon, Loader2, RowsIcon } from 'lucide-react'
import { SearchBar } from './search-bar'
import { useState } from 'react'
import { DataTable } from './file-table'
import { columns } from './columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Doc } from '@/convex/_generated/dataModel'
import TypeFilter from './type-filter'

function Placeholder() {
  return (
    <div className="flex flex-col gap-6 w-full items-center mt-16">
      <Image
        src="/empty.svg"
        width={300}
        height={300}
        className="opacity-95 h-[200px] w-[200px] md:max-h-[300px] md:w-[300px]"
        alt="placeholder for workspace"
      />
      <div className="text-xl md:text-2xl">
        You have no files in your workspace now.
      </div>
      <UploadButton />
    </div>
  )
}

export function FileBrowser({
  title,
  favoritesOnly,
  deleteOnly,
}: {
  title: string
  favoritesOnly?: boolean
  deleteOnly?: boolean
}) {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<Doc<'files'>['type'] | 'all'>('all')

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : 'skip'
  )

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          query,
          favorites: favoritesOnly,
          deleteOnly,
          type: type === 'all' ? undefined : type,
        }
      : 'skip'
  )
  const isLoading = files === undefined

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorited: (favorites ?? []).some(
        (favorite) => favorite.fileId === file._id
      ),
    })) ?? []

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mt-2 mb-4 md:mb-8">
        <h1 className="text-2xl uppercase md:normal-case tex lg:text-4xl font-bold">
          {title}
        </h1>

        <SearchBar query={query} setQuery={setQuery} />
        {!deleteOnly && <UploadButton />}
      </div>

      <Tabs defaultValue="grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8">
          <TypeFilter
            type={type}
            setType={setType}
            styles="block mb-2 md:hidden"
          />
          <TabsList>
            <TabsTrigger
              value="grid"
              className="flex gap-1 items-center justify-center"
            >
              <GridIcon className="w-4 h-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="flex gap-1 items-center justify-center"
            >
              <RowsIcon className="w-4 h-4" />
              Table
            </TabsTrigger>
          </TabsList>
          <TypeFilter type={type} setType={setType} styles="hidden md:block" />
        </div>
        {isLoading && (
          <div className="flex flex-col gap-3 w-full items-center mt-16">
            <Loader2 className="h-12 w-12 animate-spin opacity-90 text-gray-500" />
            <div className="text-sm md:text-md">Loading files...</div>
          </div>
        )}
        <TabsContent value="grid">
          <div className="flex flex-wrap gap-4">
            {modifiedFiles?.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={modifiedFiles} />
        </TabsContent>
      </Tabs>

      {files?.length === 0 && <Placeholder />}
    </div>
  )
}
