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

## Current trust state

The initial manifests are informational and use `signature: null` until the Ed25519 release-signing pipeline is introduced. Update clients must fail closed and must not automatically install an unsigned package. CubeDonate CMS continues to download commercial releases from its authorized private source.

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

Copyright © 2026 OzyrusDev. All rights reserved. See [NOTICE.md](NOTICE.md).
