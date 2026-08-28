# Public update verification keys

Only public Ed25519 verification keys may be stored in this directory.

Private signing keys must remain outside every Git repository and should be supplied to the release workflow through an encrypted secret store.

The active CMS key is `updates-ed25519-public.pem`. Manifests are canonicalized by recursively sorting object keys and omitting only the top-level `$schema` and `signature` fields before Ed25519 verification.
