"use client"
import Link from "next/link"
import { useState } from "react"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/creator" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white ml-1"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">EMM-Fort</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/creator" className="text-red-500 font-medium hover:text-red-600 transition-colors">
              Home
            </Link>
            <Link href="/creator/about" className="text-gray-700 hover:text-red-500 transition-colors">
              About us
            </Link>
            <Link href="/creator/platform" className="text-gray-700 hover:text-red-500 transition-colors">
              Platform
            </Link>
            <Link href="/creator/membership" className="text-gray-700 hover:text-red-500 transition-colors">
              Memebership
            </Link>
            <Link href="/creator/contact" className="text-gray-700 hover:text-red-500 transition-colors">
              Contact us
            </Link>                        
          </nav>

          {/* CTA Button */}
          <Link
            href="/creator/membership"
            className="hidden md:inline-flex bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Join Creator Program
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/creator" className="text-red-500 font-medium">
                Home
              </Link>
              <Link href="/creator/about" className="text-gray-700 hover:text-red-500 transition-colors">
                About us
              </Link>
              <Link href="/creator/platform" className="text-gray-700 hover:text-red-500 transition-colors">
                Platform
              </Link>
              <Link href="/creator/membership" className="text-gray-700 hover:text-red-500 transition-colors">
                Memebership
              </Link>
              <Link href="/creator/contact" className="text-gray-700 hover:text-red-500 transition-colors">
                Contact us
              </Link>             
              <Link
                href="/creator/membership"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold px-6 py-3 rounded-full text-center"
              >
                Join Creator Program
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
export { Header }
