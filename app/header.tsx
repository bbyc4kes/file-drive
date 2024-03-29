import { Button } from '@/components/ui/button'
import {
  OrganizationSwitcher,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import React from 'react'

const Header = () => {
  return (
    <div className="border-b py-4 bg-stone-50">
      <div className="items-center container mx-auto justify-between flex">
        <div>FileDrive</div>
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
