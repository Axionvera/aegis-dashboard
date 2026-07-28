# Contributing to Aegis Dashboard

We love open-source contributions! To ensure a smooth process:

1. **Branch Naming:** Use `feat/`, `fix/`, or `ui/`.
2. **Component Rules:** If building a new UI component, ensure it is fully responsive (mobile-first via Tailwind).
3. **Pull Requests:** Include a screenshot or GIF of your UI changes in the PR description.

## Description.md

`Description.md` in the repository root is **not** a duplicate of `README.md`. It exists
specifically to satisfy external grant programs and open-source registry platforms
(e.g. GrantFox OSS / FWC26, Gitcoin) that require a short standalone description file
rather than consuming `README.md` directly.

**Maintenance rule:** Whenever the project summary in `README.md` is updated, update
the corresponding paragraph in `Description.md` as well so the two files stay in sync.
Do **not** delete `Description.md` without first confirming that no external listing
still depends on it.