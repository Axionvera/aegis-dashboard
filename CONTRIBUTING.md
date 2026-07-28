# Contributing to Aegis Dashboard

We love open-source contributions! To ensure a smooth process:

1. **Branch Naming:** Use `feat/`, `fix/`, or `ui/`.
2. **Component Rules:** If building a new UI component, ensure it is fully responsive (mobile-first via Tailwind).
3. **Accessibility:** All UI contributions must follow the [Accessibility Review Checklist](docs/accessibility-checklist.md). At minimum: every input has an associated `<label>`, every interactive element is keyboard operable with a visible focus indicator, overlays trap and restore focus, and async results are announced. See the [component expectations](docs/accessibility-checklist.md#10-component-expectations) for the per-component contract.
4. **Pull Requests:** Include a screenshot or GIF of your UI changes in the PR description, and paste the [accessibility PR checklist](docs/accessibility-checklist.md#12-pr-checklist) with the items relevant to your change ticked. Reviewers are expected to check it.