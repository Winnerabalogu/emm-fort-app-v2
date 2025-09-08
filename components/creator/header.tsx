"use client"
import Link from "next/link"
import { useState, useEffect } from "react"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close mobile menu when clicking outside or on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/creator" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white ml-1"></div>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">EMM-Fort</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/creator" className="text-red-500 font-medium hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50">
              Home
            </Link>
            <Link href="/creator/about" className="text-gray-700 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              About us
            </Link>
            <Link href="/creator/platform" className="text-gray-700 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              Platform
            </Link>
            <Link href="/creator/membership" className="text-gray-700 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              Membership
            </Link>
            <Link href="/creator/contact" className="text-gray-700 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              Contact us
            </Link>
          </nav>

          {/* CTA Button - Desktop */}
          <Link
            href="/creator/auth/login"
            className="hidden lg:inline-flex bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-4 xl:px-6 py-2.5 xl:py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm xl:text-base flex-shrink-0"
          >
            <span className="hidden xl:inline">Join Creator Program</span>
            <span className="xl:hidden">Join Program</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-container lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Menu */}
            <div className={`
              absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg
              transition-all duration-300 ease-in-out transform origin-top
              ${isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}
            `}>
              <div className="container mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-1">
                  <Link 
                    href="/creator" 
                    className="text-red-500 font-medium px-3 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/creator/about" 
                    className="text-gray-700 hover:text-red-500 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About us
                  </Link>
                  <Link 
                    href="/creator/platform" 
                    className="text-gray-700 hover:text-red-500 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Platform
                  </Link>
                  <Link 
                    href="/creator/membership" 
                    className="text-gray-700 hover:text-red-500 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Membership
                  </Link>
                  <Link 
                    href="/creator/contact" 
                    className="text-gray-700 hover:text-red-500 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact us
                  </Link>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <Link
                      href="/creator/auth/login"
                      className="block bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-full text-center transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join Creator Program
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
export { Header }