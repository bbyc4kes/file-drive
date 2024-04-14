'use client'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  OrganizationSwitcher,
  SignIn,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  const { theme } = useTheme()
  return (
    <div className="relative z-10 border-b py-4">
      <div className="items-center container mx-auto justify-between gap-2 flex">
        <Link href="/" className="flex gap-2 items-center text-xl">
          <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="FileDrive logo"
            className="hidden md:block"
          />
          <span className="hidden md:inline font-semibold">FileDrive</span>
        </Link>

        <SignedIn>
          <Link href={'/dashboard/files'} className="lg:absolute lg:left-1/2">
            <Button
              variant={'outline'}
              className="absolute top-4 left-4 hidden sm:block md:top-0 md:left-0 md:relative"
            >
              Storage
            </Button>
          </Link>
        </SignedIn>
        <div className="flex gap-3 items-center">
          <OrganizationSwitcher
            appearance={
              theme === 'dark'
                ? {
                    baseTheme: dark,
                  }
                : undefined
            }
          />
          <UserButton />
          <ModeToggle />
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
