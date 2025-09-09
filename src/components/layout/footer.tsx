import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
            About Us
          </Link>
          <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
            Contact
          </Link>
          <Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">
            FAQ
          </Link>
          <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
            Terms of Service
          </Link>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          © {new Date().getFullYear()} Omaima. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
