import Head from "next/head";
import BulkComplianceReview from "@/features/admin/components/BulkComplianceReview";
import RouteGuard from "@/components/RouteGuard";
import { sampleSubjects } from "@/lib/__fixtures__/complianceReview";

export default function ComplianceBulkReview() {
  const initial = sampleSubjects;

  return (
    <RouteGuard path="/compliance">
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
            console.info(`[compliance] ${action} applied to ${ids.length} subject(s)`);
          }}
        />
      </div>
    </RouteGuard>
  );
}
