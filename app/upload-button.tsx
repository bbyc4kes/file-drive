'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>(
      (val) => val instanceof FileList,
      'This field is required'
    )
    .refine((files) => files.length > 0, 'This field is required'),
})

export default function UploadButton() {
  const { toast } = useToast()
  const organization = useOrganization()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const user = useUser()
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      file: undefined,
    },
  })

  const fileRef = form.register('file')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    console.log('files:', values.file)

    if (!orgId) return

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl()
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': values.file[0].type },
      body: values.file[0],
    })
    const { storageId } = await result.json()

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
      })

      setIsFileDialogOpen(false)
      form.reset()

      toast({
        variant: 'default',
        title: 'File was successfully uploaded!',
        description: 'Now you can manage your file in your workspace.',
      })
    } catch (err) {
      setIsFileDialogOpen(false)

      toast({
        variant: 'destructive',
        title: 'Oops, something went wrong!',
        description:
          'Your file could not be uploaded. Please, try again later.',
      })
    }
  }

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }

  const createFile = useMutation(api.files.createFile)

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen)
        form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={() => {}}>Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">Upload your file here.</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input type="file" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="flex gap-1"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting ? 'Uploading...' : 'Submit'}
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
