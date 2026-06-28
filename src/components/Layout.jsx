import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* pb-20 on mobile gives space above the bottom nav */}
      <main className="px-4 py-6 pb-20 md:pb-6 max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
