# Hope Language Data — Safe Sync Contract

Hope's personal chatbot is `hope-conversation-v1.js` on this repository. The separate `Hope-language-data.html` in `artist1970/creative-spark.github.io` is a browser-local Code Capsule, not an automatically synchronized database.

## Publishing boundary
- No silent transfer between sites, localStorage origins, or repositories.
- Only explicitly exported, reviewed, non-sensitive fictional or public support Q&A records may be published to Hope's repository.
- Reject private narratives, student records, identity numbers, health records, benefit case details, addresses, credentials, and unverified service availability.
- Every record needs a stable ID, category, question, approved response, provenance, review status, and version.
- Resource statements must be sourced, dated, and checked for availability before being presented as current.
- Import is disabled until an explicit consent, validation, review, and publication pipeline has passed tests.
- Keep Hope's distinct support identity and handoff boundaries. No automated decisions or administrative permissions.

## Current state
The landing-page conversation is connected to a local, bounded rule-based engine. The Code Capsule is unchanged and **not synced**. Future bridge development must preserve the existing chat while validating fictional records and rollback behavior.
