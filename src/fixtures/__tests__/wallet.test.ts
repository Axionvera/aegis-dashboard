import {
  walletConnectedTestnet,
  walletConnectedMainnet,
  walletDisconnected,
  walletConnecting,
  walletUnknownNetwork,
} from '@/fixtures'

describe('Wallet fixtures', () => {
  it('connected testnet has valid address and network', () => {
    expect(walletConnectedTestnet.address).toBeTruthy()
    expect(walletConnectedTestnet.address.startsWith('G')).toBe(true)
    expect(walletConnectedTestnet.network).toContain('Test')
  })

  it('connected mainnet has valid address and network', () => {
    expect(walletConnectedMainnet.address).toBeTruthy()
    expect(walletConnectedMainnet.network).toContain('Public')
  })

  it('disconnected state has null address and network', () => {
    expect(walletDisconnected.address).toBeNull()
    expect(walletDisconnected.network).toBeNull()
  })

  it('connecting state has isConnecting true', () => {
    expect(walletConnecting.isConnecting).toBe(true)
    expect(walletConnecting.address).toBeNull()
  })

  it('unknown network has a non-empty network string', () => {
    expect(walletUnknownNetwork.network).toBeTruthy()
    expect(walletUnknownNetwork.network).not.toContain('Test')
    expect(walletUnknownNetwork.network).not.toContain('Public')
  })
})
