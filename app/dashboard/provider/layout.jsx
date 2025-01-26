import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProviderDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard/provider" className="text-xl font-bold">
                  Service Provider Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/provider/services">Manage Services</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/provider/orders">Orders</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/provider/earnings">Earnings</Link>
              </Button>
              <Button variant="ghost">Logout</Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

