import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserRound } from 'lucide-react'

const navLink = [
   {
      name: 'Home',
      url: '/',
   },
   {
      name: 'Plan Trip',
      url: '/preference',
   },
   {
      name: 'My Trips',
      url: '/trips',
   },
]

export function HeaderNav() {
   return (
      <div className="flex flex-col items-center gap-y-2">
         <header>
            <p className="mx-auto text-3xl text-white">Glob!</p>
         </header>
         <header className="mx-auto">
            <nav className="mx-auto grid grid-flow-col justify-center gap-x-1 rounded-full bg-primary px-10 md:gap-x-4">
               {navLink.map((nav) => (
                  <Link
                     key={nav.name}
                     href={nav.url}
                     className="text-sm font-medium"
                     prefetch={false}
                  >
                     <Button variant="link" className="rounded-full text-white">
                        {nav.name}
                     </Button>
                  </Link>
               ))}
               {/* <Button variant="link" className="rounded-full">
                  <UserRound className="h-5 w-5 text-white" />
               </Button> */}
            </nav>
         </header>
      </div>
   )
}
