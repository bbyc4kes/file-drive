import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  StarOffIcon,
  TrashIcon,
  UndoIcon,
} from 'lucide-react'
import React, { ReactNode, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { Protect } from '@clerk/nextjs'

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

  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    if (!file.url) return

    const fileName = file.name

    setDownloading(true)

    fetch(file.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `${fileName}${
            file.type === 'image'
              ? '.png'
              : file.type === 'pdf'
              ? '.pdf'
              : file.type === 'txt'
              ? '.txt'
              : file.type === 'csv'
              ? '.csv'
              : ''
          }`
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => console.error('Error downloading file:', error))
      .finally(() => setDownloading(false))
  }

  let isFavorited = false

  if (favorites) {
    isFavorited = favorites.some((favorite) => favorite.fileId === file._id)
  }

  return (
    <Card className="w-[279px]">
      <div className="flex flex-col h-full">
        <CardHeader className="relative min-h-[120px]">
          <CardTitle className="flex gap-[6px] mr-6 break-words">
            <div className="flex justify-center">{iconTypes[file.type]}</div>
            <div className="overflow-auto">{file.name}</div>
          </CardTitle>
          <div className="absolute top-2 right-2">
            <FileCardActions file={file} isFavorited={isFavorited} />
          </div>
        </CardHeader>
        <CardContent className=" max-h-72 my-4 overflow-hidden flex justify-center items-center pb-0">
          <div className="flex justify-center">
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
          <CardFooter className="flex justify-center">
            <Button onClick={handleDownload} disabled={downloading}>
              Download
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
