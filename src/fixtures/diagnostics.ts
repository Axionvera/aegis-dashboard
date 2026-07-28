/**
 * src/fixtures/diagnostics.ts
 *
 * Mock diagnostics report fixture for local development.
 *
 * Returned by the DiagnosticsPanel when mock mode is active, so contributors
 * can verify the full diagnostics UI without live environment variables.
 *
 * The mockMode flag is explicitly set to `true` here so the rendered report
 * makes the mock state unmistakable.
 *
 * Consumed by: DiagnosticsPanel (mock path), tests.
 */

export const mockDiagnosticsFixture = {
  timestamp: '2026-07-28T12:00:00.000Z',
  sdkVersion: '[MOCK] v0.0.0-local',
  rpc: '[MOCK] Not connected — mock provider active',
  contract: '[MOCK] Not deployed — mock provider active',
  wallet: 'GCFXMOCKWALLET0000000000000000000000000000000000000000',
  network: 'LOCAL_MOCK',
  flags: {
    newMintFlow: false,
    complianceBanner: true,
    darkMode: false,
    mockMode: true,
  },
} as const;
