'use client'

import { api } from '@/convex/_generated/api'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'

import UploadButton from './dashboard/_components/upload-button'
import { FileCard } from './dashboard/_components/file-card'
import Image from 'next/image'
import { FileIcon, Loader2, StarIcon } from 'lucide-react'
import { SearchBar } from './dashboard/_components/search-bar'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

export default function Home() {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState('')

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query } : 'skip')
  const isLoading = files === undefined || files === null

  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-8">
        <div className="w-40 flex flex-col gap-4">
          <Link href={'/dashboard/files'}>
            <Button variant={'link'} className="flex gap-2 pl-0">
              <FileIcon /> All Files
            </Button>
          </Link>

          <Link href={'/dashboard/favorites'}>
            <Button variant={'link'} className="flex gap-2 pl-0">
              <StarIcon /> Favorites
            </Button>
          </Link>
        </div>

        <div className="w-full">
          {isLoading && (
            <div className="flex flex-col gap-3 w-full items-center mt-16">
              <Loader2 className="h-12 w-12 animate-spin opacity-90 text-gray-500" />
              <div className="text-sm md:text-md">Loading images...</div>
            </div>
          )}

          {!isLoading && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Your Files</h1>
                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton />
              </div>

              <div className="flex flex-wrap gap-4">
                {files?.map((file) => (
                  <FileCard key={file._id} file={file} />
                ))}
              </div>
              {files?.length === 0 && <Placeholder />}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
