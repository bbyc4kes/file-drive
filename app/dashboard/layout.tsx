// export const metadata: Metadata = {
//   title: 'File Drive',
//   description:
//     'Store, upload and manage files with your team using File Drive!',
// }

import { SideNav } from './side-nav'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-8">
        <SideNav />

        <div className="w-full">{children}</div>
      </div>
    </main>
  )
}
