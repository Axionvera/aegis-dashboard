import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import Disclaimer from './Disclaimer';

interface TransferModalProps {
  ticker: string;
  onClose: () => void;
}

const TRANSFER_DISCLAIMER =
  'Transfers are subject to protocol-level allowlist restrictions only. You are solely responsible for ensuring this transfer complies with applicable off-chain securities, tax, and transfer laws in your jurisdiction. On-chain transactions are irreversible once submitted.';

export default function TransferModal({ ticker, onClose }: TransferModalProps) {
  const { checkWhitelist, transfer, isLoading } = useAegis();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleTransfer = async () => {
    setError('');
    if (!recipient || !amount) return setError('Fill all fields');

    // Protocol-level allowlist check (NOT a substitute for legal verification).
    const isAllowed = await checkWhitelist(recipient);
    if (!isAllowed) {
      return setError('Recipient is not on the protocol allowlist.');
    }

    try {
      await transfer(recipient, parseFloat(amount));
      alert('Transfer Successful!');
      onClose();
    } catch (err) {
      setError('Transaction failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Transfer {ticker}</h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Address</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
              placeholder="GABC..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <Disclaimer variant="modal" text={TRANSFER_DISCLAIMER} className="mb-4" />

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={isLoading}
            className="flex-1 bg-aegis-brand hover:bg-blue-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}
