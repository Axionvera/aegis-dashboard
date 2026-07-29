"use client";

import { truncateAddress } from "@/utils/formatting";
import { X } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
  },
  {
    label: "Admin ",
    href: "/admin",
  },
];

interface MobileNavProps {
  isConnected: boolean;
  isMobileMenuOpen: boolean;
  address?: string;
  disconnect: () => void;
  isConnecting: boolean;
  onConnectWallet: () => void;
  onClose: () => void;
  errorConnecting: boolean;
}

export default function MobileNav({
  isConnected,
  isMobileMenuOpen,
  address,
  disconnect,
  isConnecting,
  onConnectWallet,
  onClose,
  errorConnecting,
}: MobileNavProps) {
  return (
    <div
      id="mobile-navigation"
      className={`fixed left-0 top-0 z-50 h-screen w-full overflow-y-auto bg-white transition-all duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        {/* Close Button */}
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Mobile navigation">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-md px-3 py-3 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Wallet Actions */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          {isConnected && address ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  onClose();
                }}
                className="btn-outline w-full"
              >
                Disconnect {truncateAddress(address)}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onConnectWallet}
                className="bg-aegis-brand hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm transition disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
              {errorConnecting && !isConnecting && (
                <p className="text-red-500 text-sm mt-2">
                  Error connecting to wallet. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
