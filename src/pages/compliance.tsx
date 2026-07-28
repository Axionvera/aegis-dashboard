import Head from "next/head";
import BulkComplianceReview from "@/features/admin/components/BulkComplianceReview";
import { useWallet } from "@/hooks/useWallet";
import { sampleSubjects } from "@/lib/__fixtures__/complianceReview";

export default function ComplianceBulkReview() {
  const { address } = useWallet();

  // In a real deployment this queue would be sourced from the contract/SDK
  // layer (e.g. via `useAegis`) and filtered to the admin's jurisdiction.
  const initial = sampleSubjects;

  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">
          Connect a wallet to review compliance
        </h2>
        <p className="text-slate-500 mt-2">
          Bulk compliance review requires an authorized admin session.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Bulk Compliance Review | Aegis RWA</title>
      </Head>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Bulk Compliance Review
        </h1>
        <BulkComplianceReview
          initialSubjects={initial}
          canAct
          onAction={(action, ids) => {
            // In production this would broadcast the batched on-chain action.
            console.info(`[compliance] ${action} applied to ${ids.length} subject(s)`);
          }}
        />
      </div>
    </>
  );
}
