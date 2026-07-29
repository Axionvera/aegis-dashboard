import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/utils/formatting";
import { Shield, X, Menu } from "lucide-react";
import MobileNav from "./MobileNav";
import { useState } from "react";

export default function Navbar() {
  const {
    address,
    network,
    isConnecting,
    connect,
    disconnect,
    errorConnecting,
  } = useWallet();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-6">
        <Link
          href="/"
          className="flex items-center space-x-2 text-aegis-dark font-bold text-xl"
        >
          <Shield className="text-aegis-brand" />
          <span>Aegis RWA</span>
        </Link>
        <div className="hidden md:flex space-x-4 text-sm font-medium text-slate-600">
          <Link href="/portfolio" className="hover:text-aegis-brand transition">
            Portfolio
          </Link>
          <Link href="/admin" className="hover:text-aegis-brand transition">
            Admin
          </Link>
        </div>
      </div>

      <div className="hidden md:flex">
        {address ? (
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
              {network}
            </span>
            <button
              onClick={disconnect}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-md font-medium text-sm transition"
            >
              {truncateAddress(address)}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={connect}
              disabled={isConnecting}
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
      <Menu
        className="md:hidden cursor-pointer"
        onClick={() => setShowMobileMenu(true)}
      />
      <MobileNav
        isConnected={!!address}
        disconnect={disconnect}
        address={address || ""}
        onConnectWallet={connect}
        onClose={() => setShowMobileMenu(false)}
        isConnecting={isConnecting}
        isMobileMenuOpen={showMobileMenu}
        errorConnecting={errorConnecting}
      />
    </nav>
  );
}
