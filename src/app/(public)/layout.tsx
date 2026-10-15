"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AiChatButton } from "@/features/ai/AiChat";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Products" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo-indocassava.jpeg"
                alt="INDOCASSAVA Export"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900 tracking-tight leading-tight">
                  INDOCASSAVA
                </span>
                <span className="text-[10px] text-primary uppercase tracking-widest font-medium">
                  Export
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2 rounded-md hover:bg-primary/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 px-3 py-2.5 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200 space-y-1">
                <Link
                  href="/login"
                  className="block text-sm font-medium text-gray-600 px-3 py-2.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-sm font-medium bg-primary text-white px-3 py-2.5 rounded-md text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo-indocassava.jpeg" alt="INDOCASSAVA" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h3 className="text-white font-semibold text-sm">INDOCASSAVA</h3>
                  <p className="text-[10px] text-primary uppercase tracking-widest">Export</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Leading cassava trading company in Southeast Asia. From root to global market — connecting Indonesian farmers with the world.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shop" className="hover:text-white transition-colors">Fresh Cassava</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Cassava Flour</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Cassava Chips</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Tapioca Starch</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Surabaya, East Java, Indonesia</li>
                <li>info@indocassava.com</li>
                <li>+62 31 123 4567</li>
                <li>WhatsApp: +62 812 3456 7890</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} INDOCASSAVA Export. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/shop" className="hover:text-white transition-colors">Products</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chat Button for Public Pages */}
      <AiChatButton href="/ai" />
    </div>
  );
}
