import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Doc } from '@/convex/_generated/dataModel'
import {
  DownloadIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  StarOffIcon,
  TrashIcon,
  UndoIcon,
} from 'lucide-react'
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import React, { ReactNode, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { Protect } from '@clerk/nextjs'
import { formatRevalidate } from 'next/dist/server/lib/revalidate'

function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<'files'> & { url: string | null }
  isFavorited: boolean
}) {
  const deleteFiles = useMutation(api.files.deleteFile)
  const restoreFile = useMutation(api.files.restoreFile)
  const toggleFavorite = useMutation(api.files.toggleFavorite)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { toast } = useToast()

  const handleDownload = () => {
    if (!file.url) return

    const fileName = file.name
    const fileTypeExtensions = {
      image: '.png',
      pdf: '.pdf',
      txt: '.txt',
      csv: '.csv',
    }

    fetch(file.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]))
        const extension = fileTypeExtensions[file.type] || ''
        const downloadFileName = fileName + extension

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', downloadFileName)

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => console.error('Error downloading file:', error))
  }
  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the file for our deletion process. You can
              undone this action in your trash can.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFiles({ fileId: file._id })
                toast({
                  variant: 'default',
                  title: 'File was successfully marked!',
                  description: 'Your file will be deleted soon.',
                })
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={handleDownload}
            className="flex gap-1 items-center cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              toggleFavorite({
                fileId: file._id,
              })
            }
            className="flex gap-1 items-center cursor-pointer"
          >
            {isFavorited ? (
              <span className="flex items-center justify-center gap-1 hover:text-gray-700">
                <StarOffIcon className="w-4 h-4" /> Unfavorite
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <StarIcon className="w-4 h-4" /> Favorite
              </span>
            )}
          </DropdownMenuItem>
          <Protect role={'org:admin'} fallback={<></>}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (file.markedAsDeleted) {
                  restoreFile({
                    fileId: file._id,
                  })
                } else {
                  setIsConfirmOpen(true)
                }
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              {file.markedAsDeleted ? (
                <div className="flex gap-1 items-center cursor-pointer text-green-600">
                  <UndoIcon className="w-4 h-4" /> Restore
                </div>
              ) : (
                <div className="flex gap-1 items-center cursor-pointer text-red-600">
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function FileCard({
  file,
  favorites,
}: {
  file: Doc<'files'> & { url: string | null }
  favorites: Doc<'favorites'>[]
}) {
  const iconTypes = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    txt: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<'files'>['type'], ReactNode>

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  })

  let isFavorited = false

  if (favorites) {
    isFavorited = favorites.some((favorite) => favorite.fileId === file._id)
  }

  return (
    <Card className="w-[279px]">
      <div className="flex flex-col h-full">
        <CardHeader className="relative min-h-10 pb-0">
          <CardTitle className="flex gap-[6px] break-words text-base font-normal justify-center items-center text-center">
            <div className="absolute top-4 left-4">{iconTypes[file.type]}</div>
            <div className="overflow-auto h-12 text-center mt-6">
              {file.name}
            </div>
          </CardTitle>
          <div className="absolute top-2 right-2">
            <FileCardActions file={file} isFavorited={isFavorited} />
          </div>
        </CardHeader>
        <CardContent className="max-h-72 mb-4 overflow-hidden flex justify-center items-center pb-0">
          <div className="flex justify-center p-2">
            {file.type === 'image' && file.url && (
              <Image
                alt={file.name}
                width={200}
                height={200}
                src={file.url}
                className="max-h-52 object-cover"
              />
            )}
            {file.type === 'csv' && <GanttChartIcon className="w-20 h-20" />}
            {file.type === 'pdf' && <FileTextIcon className="w-20 h-20" />}
            {file.type === 'txt' && <FileTextIcon className="w-20 h-20" />}
          </div>
        </CardContent>
        <div className="mt-auto">
          <CardFooter className="flex justify-between">
            <div className="flex gap-2 text-xs items-center text-gray-700 w-40">
              <Avatar className="w-6 h-6">
                <AvatarImage src={userProfile?.image} />
                <AvatarFallback>
                  {userProfile?.name
                    ?.split(' ')
                    .map((word) => word[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {userProfile?.name}
            </div>
            <div className="text-xs text-gray-700">
              Updated on{' '}
              {formatRelative(new Date(file._creationTime), new Date())}
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
