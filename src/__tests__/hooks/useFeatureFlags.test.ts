import { useFeatureFlags } from '../../hooks/useFeatureFlags';

beforeEach(() => {
  useFeatureFlags.getState().resetFlags();
});

describe('useFeatureFlags', () => {
  it('has the expected default values', () => {
    const { flags } = useFeatureFlags.getState();
    expect(flags.newMintFlow).toBe(true);
    expect(flags.complianceBanner).toBe(true);
    expect(flags.darkMode).toBe(false);
  });

  it('toggles a flag from true to false', () => {
    const { toggleFlag } = useFeatureFlags.getState();
    toggleFlag('newMintFlow');
    expect(useFeatureFlags.getState().flags.newMintFlow).toBe(false);
  });

  it('toggles a flag back to its original value', () => {
    const { toggleFlag } = useFeatureFlags.getState();
    toggleFlag('darkMode');
    toggleFlag('darkMode');
    expect(useFeatureFlags.getState().flags.darkMode).toBe(false);
  });

  it('sets a flag to an explicit value', () => {
    const { setFlag } = useFeatureFlags.getState();
    setFlag('complianceBanner', false);
    expect(useFeatureFlags.getState().flags.complianceBanner).toBe(false);
  });

  it('ignores toggling an unknown flag key without throwing', () => {
    const { toggleFlag } = useFeatureFlags.getState();
    const before = { ...useFeatureFlags.getState().flags };

    expect(() => {
      // @ts-expect-error intentionally invalid key to test the guard
      toggleFlag('notARealFlag');
    }).not.toThrow();

    expect(useFeatureFlags.getState().flags).toEqual(before);
  });

  it('ignores setting an unknown flag key without throwing', () => {
    const { setFlag } = useFeatureFlags.getState();
    const before = { ...useFeatureFlags.getState().flags };

    expect(() => {
      // @ts-expect-error intentionally invalid key to test the guard
      setFlag('notARealFlag', true);
    }).not.toThrow();

    expect(useFeatureFlags.getState().flags).toEqual(before);
  });

  it('resetFlags restores all flags to defaults', () => {
    const { toggleFlag, resetFlags } = useFeatureFlags.getState();
    toggleFlag('newMintFlow');
    toggleFlag('darkMode');

    resetFlags();

    const { flags } = useFeatureFlags.getState();
    expect(flags.newMintFlow).toBe(true);
    expect(flags.darkMode).toBe(false);
  });

  it('isEnabled reflects current flag state', () => {
    const { setFlag, isEnabled } = useFeatureFlags.getState();
    expect(isEnabled('newMintFlow')).toBe(true);

    setFlag('newMintFlow', false);
    expect(useFeatureFlags.getState().isEnabled('newMintFlow')).toBe(false);
  });

  // --- mockMode flag ---

  it('mockMode flag exists and can be toggled', () => {
    const { toggleFlag } = useFeatureFlags.getState();

    const before = useFeatureFlags.getState().flags.mockMode;
    toggleFlag('mockMode');
    expect(useFeatureFlags.getState().flags.mockMode).toBe(!before);
  });

  it('mockMode flag can be set to an explicit value', () => {
    const { setFlag } = useFeatureFlags.getState();

    setFlag('mockMode', true);
    expect(useFeatureFlags.getState().flags.mockMode).toBe(true);

    setFlag('mockMode', false);
    expect(useFeatureFlags.getState().flags.mockMode).toBe(false);
  });

  it('mockMode flag is included in resetFlags', () => {
    const { setFlag, resetFlags } = useFeatureFlags.getState();
    // Drive mockMode to the opposite of its env-seeded default.
    const envDefault = useFeatureFlags.getState().flags.mockMode;
    setFlag('mockMode', !envDefault);

    resetFlags();

    // After reset, it should equal the env-seeded default again.
    expect(useFeatureFlags.getState().flags.mockMode).toBe(envDefault);
  });

  it('mockMode flag default matches NEXT_PUBLIC_MOCK_MODE env var', () => {
    // After resetFlags the flag should reflect the env var, not a hardcoded value.
    const envValue = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
    useFeatureFlags.getState().resetFlags();
    expect(useFeatureFlags.getState().flags.mockMode).toBe(envValue);
  });
});
