import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <div className="h-40 bg-gray-100 mt-12 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex flex-col w-full">
          <div className="flex justify-center">
            <div className="flex items-center gap-6">
              <Link className="text-gray-500 hover:text-blue-500" href="/">
                <Image
                  src="/logo.png"
                  width={40}
                  height={40}
                  alt="FileDrive logo"
                  className="block"
                />
              </Link>

              <Link
                className="text-gray-500 cursor-default hover:text-blue-500"
                href="/privacy"
              >
                Privacy Policy
              </Link>
              <Link
                className="text-gray-500 cursor-default  hover:text-blue-500"
                href="/terms-of-service"
              >
                Terms of Service
              </Link>
              <Link
                className="text-gray-500 cursor-default hover:text-blue-500"
                href="/about"
              >
                About
              </Link>
            </div>
          </div>
          <div className="flex justify-center mt-4 text-xs text-gray-500">
            © 2024 All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  )
}
