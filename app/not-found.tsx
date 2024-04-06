import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="flex flex-col gap-6">
        <h2 className="font-semibold mx-auto text-2xl">404 | Not Found</h2>
        <p className="text-xl ">Could not find requested resource</p>
        <Button>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
