import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
  TrashIcon,
} from 'lucide-react'
import React, { ReactNode, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

function FileCardActions({
  file,
}: {
  file: Doc<'files'> & { url: string | null }
}) {
  const deleteFiles = useMutation(api.files.deleteFile)
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
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
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
            className="flex gap-1 items-center cursor-pointer text-yellow-400"
          >
            <StarIcon className="w-4 h-4" />
            Favorite
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsConfirmOpen(true)}
            className="flex gap-1 items-center cursor-pointer text-red-600"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function FileCard({
  file,
}: {
  file: Doc<'files'> & { url: string | null }
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

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div className="flex justify-center">{iconTypes[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions file={file} />
        </div>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === 'image' && file.url && (
          <Image alt={file.name} width={200} height={200} src={file.url} />
        )}

        {file.type === 'csv' && <GanttChartIcon className="w-20 h-20" />}
        {file.type === 'pdf' && <FileTextIcon className="w-20 h-20" />}
        {file.type === 'txt' && <FileTextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={handleDownload} disabled={downloading}>
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
