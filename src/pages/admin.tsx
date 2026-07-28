import Head from 'next/head';
import AdminPanel from '@/components/AdminPanel';
import Disclaimer from '@/components/Disclaimer';
import { useWallet } from '@/hooks/useWallet';

const ADMIN_DISCLAIMER =
  'Administrator actions update protocol-level on-chain state only. Adding an address to the protocol allowlist enables on-chain interactions with the smart contract; it is not a legal, regulatory, or compliance determination of any kind. Minting tokens records an on-chain issuance event and does not, by itself, create, certify, or transfer any legal, beneficial, or proprietary right with respect to any underlying real-world asset. Administrators remain solely responsible for ensuring that any minting, allowlisting, or distribution activity complies with applicable laws.';

export default function Admin() {
  const { address } = useWallet();

  // In a real app, verify address against contract admin key
  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Admin Access Required</h2>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Aegis RWA</title>
      </Head>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Protocol Administration</h1>
        <AdminPanel />
        <Disclaimer variant="page" text={ADMIN_DISCLAIMER} className="mt-8" />
      </div>
    </>
  );
}
