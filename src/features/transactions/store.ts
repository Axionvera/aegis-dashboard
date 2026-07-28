import { create } from 'zustand';
import { transactionHistoryFixtures } from '@/features/transactions/fixtures';
import { normalizeTransactionRecord } from '@/features/transactions/normalize';
import { NormalizedTransaction, TransactionRecordInput } from '@/features/transactions/types';

interface TransactionHistoryState {
  records: NormalizedTransaction[];
  addRecord: (record: TransactionRecordInput) => NormalizedTransaction;
}

export const useTransactionHistoryStore = create<TransactionHistoryState>((set) => ({
  records: transactionHistoryFixtures,
  addRecord: (record) => {
    const normalized = normalizeTransactionRecord(record);
    set((state) => ({
      records: [normalized, ...state.records].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    }));
    return normalized;
  },
}));
