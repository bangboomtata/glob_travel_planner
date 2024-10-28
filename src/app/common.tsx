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
      url: '/plan',
   },
   {
      name: 'My Trips',
      url: '/trips',
   },
   {
      name: 'Dashboard',
      url: '/dashboard',
   },
]

export function HeaderNav() {
   return (
      <>
         <header className="flex items-center py-12">
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
               {/* Example of using icons */}
               <Button variant="link" className="rounded-full">
                  <UserRound className="h-5 w-5 text-white" />
               </Button>
            </nav>
         </header>
      </>
   )
}
