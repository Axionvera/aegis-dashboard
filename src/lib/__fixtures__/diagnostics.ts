export const healthyDiagnostics = {
  timestamp: '2026-07-28T12:00:00.000Z',
  sdkVersion: 'Mocked v0.0.0',
  rpc: 'https://rpc.example.com/v1/1...7890',
  contract: 'CABC...3456',
  wallet: 'GBXY...WXYZ',
  network: 'TESTNET',
  flags: {
    newMintFlow: false,
    complianceBanner: true,
    darkMode: false
  }
};

export const brokenDiagnostics = {
  timestamp: '2026-07-28T12:00:00.000Z',
  sdkVersion: 'Mocked v0.0.0',
  rpc: 'Not configured',
  contract: 'Not configured',
  wallet: 'Not connected',
  network: 'Not connected',
  flags: {
    newMintFlow: false,
    complianceBanner: true,
    darkMode: false
  }
};
