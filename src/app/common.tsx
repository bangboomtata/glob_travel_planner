import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { UserRound, ShoppingCart, AlignJustify, LogIn } from 'lucide-react'

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
                     <Button className="rounded-full text-white">
                        {nav.name}
                     </Button>
                  </Link>
               ))}
            </nav>
         </header>
      </>
   )
}

// export function Footer() {
//   return (
//     <>
//       <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
//         <p className="text-xs text-muted-foreground">
//           Copyright &copy; 2019 - 2024 MINE FACE ENTERPRISE All Rights Reserved{" "}
//         </p>
//         <nav className="flex gap-4 sm:ml-auto sm:gap-6">
//           <Link
//             href="#"
//             className="text-xs underline-offset-4 hover:underline"
//             prefetch={false}
//           >
//             Terms of Service
//           </Link>
//           <Link
//             href="#"
//             className="text-xs underline-offset-4 hover:underline"
//             prefetch={false}
//           >
//             Privacy Policy
//           </Link>
//         </nav>
//       </footer>
//     </>
//   );
// }
