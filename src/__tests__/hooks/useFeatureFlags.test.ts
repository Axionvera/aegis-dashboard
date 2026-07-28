import { useFeatureFlags } from '../../hooks/useFeatureFlags';

beforeEach(() => {
  useFeatureFlags.getState().resetFlags();
});

describe('useFeatureFlags', () => {
  it('has the expected default values', () => {
    const { flags } = useFeatureFlags.getState();
    expect(flags.newMintFlow).toBe(false);
    expect(flags.complianceBanner).toBe(true);
    expect(flags.darkMode).toBe(false);
  });

  it('toggles a flag from false to true', () => {
    const { toggleFlag } = useFeatureFlags.getState();
    toggleFlag('newMintFlow');
    expect(useFeatureFlags.getState().flags.newMintFlow).toBe(true);
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
    expect(flags.newMintFlow).toBe(false);
    expect(flags.darkMode).toBe(false);
  });

  it('isEnabled reflects current flag state', () => {
    const { setFlag, isEnabled } = useFeatureFlags.getState();
    expect(isEnabled('newMintFlow')).toBe(false);

    setFlag('newMintFlow', true);
    expect(useFeatureFlags.getState().isEnabled('newMintFlow')).toBe(true);
  });
});