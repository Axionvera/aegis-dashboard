import TransactionProgress from './TransactionProgress';
import TransactionReceipt from './TransactionReceipt';
import TransactionReview from './TransactionReview';
import { transferDetailsFixture, transactionFixtureGalleryEntries } from './fixtures';

export default function TransactionFixtureGallery() {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-aegis-brand">
          Component fixture gallery
        </h2>
        <h3 className="text-xl font-bold text-aegis-dark">
          Preview transaction states for contributors and reviewers
        </h3>
        <p className="max-w-3xl text-sm text-slate-600">
          Use these fixtures to validate review copy, progress indicators, and receipt
          states without running an on-chain flow. They are intentionally conservative and
          should be reviewed alongside the SDK and contract boundaries before launch.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {transactionFixtureGalleryEntries.map((entry) => {
          const isReceipt = entry.kind === 'receipt';
          const isReview = entry.kind === 'review';
          const isProgress = entry.kind === 'progress';

          return (
            <article
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-aegis-dark">{entry.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.description}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  {entry.kind}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                {isReview && (
                  <TransactionReview
                    details={entry.details ?? transferDetailsFixture}
                    onConfirm={() => undefined}
                    onCancel={() => undefined}
                  />
                )}

                {isProgress && (
                  <TransactionProgress state={entry.state ?? 'signing'} />
                )}

                {isReceipt && (
                  <TransactionReceipt
                    details={entry.details ?? transferDetailsFixture}
                    result={entry.result!}
                    onClose={() => undefined}
                    explorerUrl={entry.explorerUrl}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Compliance note</p>
        <p className="mt-1">
          These examples are for UI preview and review workflows only. Protocol-level
          compliance information should not be presented as legal or financial advice.
        </p>
      </div>
    </section>
  );
}
