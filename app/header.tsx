import { Button } from '@/components/ui/button'
import {
  OrganizationSwitcher,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <div className="border-b py-4 bg-stone-50">
      <div className="items-center container mx-auto justify-between gap-2 flex">
        <Link href="/" className="flex gap-2 items-center text-xl">
          <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="FileDrive logo"
            className="hidden md:block"
          />
          <span className="hidden md:inline">FileDrive</span>
        </Link>
        <Button
          variant={'outline'}
          className="absolute top-4 left-4 md:top-0 md:left-0 md:relative"
        >
          <Link href={'/dashboard/files'}>Storage</Link>
        </Button>
        <div className="flex gap-3">
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  )
}

export default Header
