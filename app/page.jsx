import Link from "next/link"
import { Button } from "@/components/ui/button"

const services = [
  { name: "Haircuts", icon: "💇" },
  { name: "Mechanical Repairs", icon: "🔧" },
  { name: "Electrical Work", icon: "⚡" },
  { name: "Plumbing", icon: "🚽" },
  { name: "House Cleaning", icon: "🧹" },
  { name: "Lawn Care", icon: "🌿" },
  { name: "Pet Grooming", icon: "🐾" },
  { name: "Personal Training", icon: "🏋️" },
  { name: "Tutoring", icon: "📚" },
  { name: "Photography", icon: "📸" },
  { name: "Catering", icon: "🍽️" },
  { name: "Interior Design", icon: "🎨" },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">ServiceHub</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button asChild variant="ghost" className="mr-2">
                <Link href="/login?role=user">User Login</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/login?role=provider">Provider Login</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to <span className="text-indigo-600">ServiceHub</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Find skilled local service providers or offer your expertise to those in need.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <Button asChild className="w-full sm:w-auto sm:mr-4 mb-2 sm:mb-0">
                <Link href="/register?role=user">Sign Up as User</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/register?role=provider">Become a Provider</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Explore Our Services</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-5 text-center">
                    <div className="text-4xl mb-2">{service.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">© 2023 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

