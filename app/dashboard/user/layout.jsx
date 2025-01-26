// import Link from "next/link"
// import { Button } from "@/components/ui/button"

// export default function UserDashboardLayout({ children }) {
//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex">
//               <div className="flex-shrink-0 flex items-center">
//                 <Link href="/dashboard/user" className="text-xl font-bold">
//                   Service Marketplace
//                 </Link>
//               </div>
//             </div>
//             <div className="flex items-center">
//               <Button variant="ghost" asChild>
//                 <Link href="/dashboard/user/bookings">Booking History</Link>
//               </Button>
//               <Button variant="ghost" asChild>
//                 <Link href="/dashboard/user/reviews">Reviews</Link>
//               </Button>
//               <Button variant="ghost">Logout</Button>
//             </div>
//           </div>
//         </div>
//       </nav>
//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
//     </div>
//   )
// }

"use client" // Add this directive since we're using client-side functionality

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function UserDashboardLayout({ children }) {
  const router = useRouter()

  // Logout function
  const handleLogout = () => {
    // Clear user session or token (e.g., remove from localStorage or cookies)
    localStorage.removeItem("token") // Example: Remove token from localStorage
    // Redirect to the home page
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard/user" className="text-xl font-bold">
                  Service Marketplace
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/user/bookings">Booking History</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/user/reviews">Reviews</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

