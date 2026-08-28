# CubeDonate Updates

Official public update metadata for **CubeDonate CMS** and **CubeDonate Launcher**.

This repository is intentionally public so installed products can check whether a new stable release exists without receiving access to the commercial CMS source code.

## Repository responsibilities

- `cms/latest.json` points to the latest stable CMS release metadata.
- `cms/releases/` contains immutable CMS release records.
- `launcher/latest.json` points to the latest public launcher release when one exists.
- `launcher/releases/` will contain immutable launcher release records.
- `schemas/` documents the JSON contracts consumed by update clients.
- `keys/` contains public verification keys only.

Commercial CMS archives, source code, credentials, database dumps, signing private keys, and customer data must never be committed here. CMS packages remain in the private [`OzyrusDev/cubedonate`](https://github.com/OzyrusDev/cubedonate) repository. Launcher source belongs in [`OzyrusDev/cubedonate_launcher`](https://github.com/OzyrusDev/cubedonate_launcher).

## Trust model

CMS manifests with schema version 2 are signed with Ed25519. The trusted public key is stored in `keys/updates-ed25519-public.pem` and is also embedded in released CMS clients. The signature covers canonical JSON with recursively sorted object keys while omitting only the top-level `$schema` and `signature` fields. Clients fail closed on unsigned, modified, incompatible, or substituted metadata.

The CMS `sha256` field identifies the deterministic tar stream produced by `git archive --format=tar <sourceCommit>`. The private release updater verifies both the exact commit and this digest before making a backup or changing the installed checkout.

## Validate a change

Node.js 22 or newer is required:

```bash
npm test
```

Every pull request and push to `main` runs the same validation through GitHub Actions.

## Publishing rules

1. Create and test the product release in its own repository.
2. Produce SHA-256 hashes for every downloadable artifact.
3. Sign the canonical release manifest outside this repository.
4. Add an immutable file under the relevant `releases/` directory.
5. Update `latest.json` only after the release is available.
6. Never rewrite an already published version record.

To sign a prepared manifest, keep the private key outside the repository and run:

```bash
CUBEDONATE_UPDATE_PRIVATE_KEY=/secure/updates-ed25519-private.pem npm run sign:cms -- cms/releases/X.Y.Z.json
```

Copyright © 2026 OzyrusDev. All rights reserved. See [NOTICE.md](NOTICE.md).
