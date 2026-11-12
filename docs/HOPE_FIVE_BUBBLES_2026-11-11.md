# Hope public mentor package — five-bubble repair receipt
Date: 2026-11-11 · Branch: main

## Canonical identity and project separation
- The current canonical PRIVATE CORE is `artist1970/CORE/HopeCore`.
- The public-facing Hope mentor package is `artist1970/Hope.github.io`.
- **Hope's Haven is a separate project** and is not edited or retired by this work.
- The public repository previously contained `HopeCore.html`, a CORE-like local interface. It was removed from the live `main` tree. This **does not erase Git history or cached copies**. Any historical exposure requires an independent review with repository ownership authorization; do not publish private CORE internals.

## Five repairs
1. Removed the public CORE-like HTML from the active public branch; the canonical private interface remains in private CORE.
2. Removed the legacy inline chat reply renderer from `index.html`; only `hope-conversation-v1.js` owns Ask, Enter, Clear, and new conversation turns. Inline starter buttons only fill the input and navigate to chat.
3. Hardened the existing 20-record approved public Q&A bank with schema, duplicate, full-bank approval and low-confidence protections. Added `creative-spark-mentor-qa-v1.js` as a **reference consumer only**, sourced from Eiren, Pierre, Archaemenes and Zelle. Hope's sensitive housing/food/health/benefit/legal/crisis questions never use the cross-mentor path. This is not a public release of Hope's 50 unapproved Creative Spark drafts.
4. Added named official public-resource starting points: `https://211.org/`, `https://www.va.gov/resources/getting-started-with-va/`, and `https://988lifeline.org/`, checked November 11, 2026. No claim of live availability or eligibility; visitors must use provider websites/human services. No transcript or location is sent to these sites automatically.
5. Added visitor-controlled persistent Voice On/Off, manual replay, an independent hero with a sticky conversation section anchor, canonical toolbar/tickers and locally scoped VNV/KA design refinements. Only the voice setting is stored, not the conversation.

## Boundaries
- No edits to the canonical private CORE or Hope's Haven.
- No student accounts, protected records, diagnosis, automated benefits decisions, live moderation or external service actions.
- Public chat remains browser-local and ephemeral. Shared Q&A uses fixed static resource loads; do not send question text in URLs.
- The 20 approved Hope records and 50 unapproved Code Capsule drafts retain their existing status.
- Deletion of a file on `main` does not remove its prior Git history.

## Verification
`tests/hope-conversation-safety.test.mjs` remains the baseline. `tests/hope-five-bubble-regression.test.mjs` verifies approved knowledge, public CORE boundary, one event handler, sensitive-routing guards, voice preference boundaries, resource links, and anchor structure. The `hope-public-chat.yml` workflow now runs both suites when the relevant files change.

The new source changes are committed to `main`; deployment and workflow outcomes must be checked against the latest GitHub Actions runs. Real browser speech and navigation behavior requires hands-on testing.
