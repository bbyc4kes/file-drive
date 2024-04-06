import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Doc } from '@/convex/_generated/dataModel'
import {
  BookTextIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
} from 'lucide-react'
import { formatRelative } from 'date-fns'
import React, { ReactNode } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Image from 'next/image'
import { FileCardActions } from './file-actions'

export function FileCard({
  file,
}: {
  file: Doc<'files'> & { isFavorited: boolean; url: string | null }
}) {
  const iconTypes = {
    image: <ImageIcon />,
    pdf: <BookTextIcon />,
    txt: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<'files'>['type'], ReactNode>

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  })

  return (
    <Card className="w-[240px] mmd:w-[240px]">
      <div className="flex flex-col h-full">
        <CardHeader className="relative min-h-10 pb-0">
          <CardTitle className="flex gap-[6px] break-words text-base font-normal justify-center items-center text-center">
            <div className="absolute top-4 left-4">{iconTypes[file.type]}</div>
            <div className="overflow-auto h-12 text-center mt-6">
              {file.name}
            </div>
          </CardTitle>
          <div className="absolute top-2 right-2">
            <FileCardActions file={file} isFavorited={file.isFavorited} />
          </div>
        </CardHeader>
        <CardContent className="max-h-72 mb-4 overflow-hidden flex justify-center items-center pb-0 min-h-[224px]">
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
                    .map((word: string) => word[0])
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
