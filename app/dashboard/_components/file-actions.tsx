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
  MoreVertical,
  StarIcon,
  StarOffIcon,
  TrashIcon,
  UndoIcon,
} from 'lucide-react'
import React, { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useToast } from '@/components/ui/use-toast'
import { Protect } from '@clerk/nextjs'

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<'files'> & { url?: string | null }
  isFavorited: boolean
}) {
  const deleteFiles = useMutation(api.files.deleteFile)
  const restoreFile = useMutation(api.files.restoreFile)
  const toggleFavorite = useMutation(api.files.toggleFavorite)
  const acc = useQuery(api.users.getAcc)

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
          <Protect
            condition={(check) => {
              return (
                check({
                  role: 'org:admin',
                }) || file.userId === acc?._id
              )
            }}
            fallback={<></>}
          >
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
