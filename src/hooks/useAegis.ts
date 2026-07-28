import { useState } from 'react';
import type {
  RawTransactionOutcome,
  TransactionPhase,
} from '@/components/transactions/types';
// import { AegisClient } from '@aegis/sdk'; // Mocked for now

/** Called as the transaction moves from wallet signature to network submission. */
type PhaseListener = (phase: TransactionPhase) => void;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Until the SDK is wired in, the amount decides the outcome so every receipt
 * state stays reachable from the UI without editing code:
 *
 *   0.01 -> failure   0.02 -> pending   0.03 -> unknown   anything else -> success
 *
 * The real client will return the RPC status here instead; `mapToTransactionResult`
 * already understands both.
 */
const mockOutcome = (amount: number, hash: string): RawTransactionOutcome => {
  switch (amount) {
    case 0.01:
      return {
        status: 'FAILED',
        errorMessage: 'Recipient account is not authorised to hold this asset.',
      };
    case 0.02:
      return { status: 'PENDING', hash };
    case 0.03:
      return { status: 'not_a_real_status', hash };
    default:
      return { status: 'SUCCESS', hash };
  }
};

/**
 * Runs the mocked signature + submission delays, reporting each phase so the
 * UI can show real progress instead of guessing. The real SDK will report the
 * same two phases: signing in the wallet, then pending on the network.
 */
const simulateSubmission = async (onPhase?: PhaseListener) => {
  onPhase?.('signing');
  await wait(600);
  onPhase?.('pending');
  await wait(900);
};

export const useAegis = () => {
const [isLoading, setIsLoading] = useState(false);

// Mock checking if a user is KYC whitelisted
const checkWhitelist = async (address: string): Promise<boolean> => {
setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate RPC
    setIsLoading(false);
    return address.startsWith('G') && address.length > 50; // Mock validation
  };

  // Mock transferring assets
  const transfer = async (to: string, amount: number, onPhase?: PhaseListener) => {
    setIsLoading(true);
    await simulateSubmission(onPhase);
    setIsLoading(false);
    return mockOutcome(amount, "mock_tx_hash_1234567890");
  };

  // Mock minting assets (Admin)
  const mint = async (to: string, amount: number, onPhase?: PhaseListener) => {
    setIsLoading(true);
    await simulateSubmission(onPhase);
    setIsLoading(false);
    return mockOutcome(amount, "mock_tx_hash_0987654321");
  };

  return { checkWhitelist, transfer, mint, isLoading };
};
