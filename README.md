# CipherGrid

<p align="center">
  <img src="public/assets/ciphergrid-readme-logo.png" alt="CipherGrid logo on a light bordered plaque" width="150" />
</p>

**CipherGrid: A Mobile OCR-Assisted Multi-Cipher Encryption, Batch Processing, and Cryptanalysis Application**

CipherGrid is an offline-first Ionic Vue application for learning, applying, and analyzing cryptographic transformations. It combines an explainable classical-cipher workspace, deterministic cryptanalysis, on-device OCR, batch file processing, reusable local recipes, QR exchange, encoding utilities, and a deliberately separate AES-256-GCM Secure Lab.

[![Ionic Vue](https://img.shields.io/badge/Ionic_Vue-8.8-3880FF?style=flat-square&logo=ionic&logoColor=white)](https://ionicframework.com/docs/vue/overview)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-42B883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?style=flat-square&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Pinia](https://img.shields.io/badge/Pinia-4.0-FFD859?style=flat-square&logo=pinia&logoColor=111318)](https://pinia.vuejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Android](https://img.shields.io/badge/Android-SDK_36-3DDC84?style=flat-square&logo=android&logoColor=white)](https://developer.android.com/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

> Classical ciphers are educational and are **not secure for real secrets**. Base64, hexadecimal, and binary are encodings, not encryption. SHA-256 is a one-way digest and cannot be decrypted.

## Contents

- [Feature overview](#feature-overview)
- [History and saved data](#history-and-saved-data)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Available commands](#available-commands)
- [Application structure](#application-structure)
- [Android development](#android-development)
- [OCR and offline behavior](#ocr-and-offline-behavior)
- [Testing and quality checks](#testing-and-quality-checks)
- [Continuous integration and releases](#continuous-integration-and-releases)
- [Contributing](#contributing)
- [Privacy and security boundaries](#privacy-and-security-boundaries)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)

## Feature overview

### Cipher workspace

The registry-driven workspace supports encryption, decryption, validation, saved results, copy/share actions, QR handoff, and step-by-step explanations for:

- Caesar, including normalized shifts and all 26 brute-force candidates
- Vigenère with alphabetic keyword validation and repeated-key visualization
- Atbash
- Affine with modular-inverse validation and candidate ranking
- Rail Fence with zigzag visualization and rail-count comparison
- Columnar Transposition with stable duplicate-key ordering
- Playfair with a 5×5 I/J key square and visible filler handling
- Hill with invertible 2×2 and 3×3 matrices
- Plaintext Autokey with running-key explanation

Cipher implementations are pure TypeScript services. They do not depend on Vue components and return structured output, warnings, metadata, and explanation steps.

### Cryptanalysis

The Analyze workspace provides deterministic, explainable tools rather than presenting scoring as machine learning:

- Caesar and Affine candidate ranking
- English and Filipino local scoring profiles
- Rail Fence candidate comparison
- Letter frequencies, n-grams, text statistics, and Index of Coincidence
- Kasiski repeated-sequence examination
- Vigenère key-length estimates and per-column frequency analysis
- Editable candidate-key suggestions
- Cautious possible-family hints with uncertainty language

### Scan and OCR

- Camera capture and gallery selection through Capacitor Camera
- Android ML Kit and iOS Vision through an `OcrService` adapter
- Lazy-loaded Tesseract worker fallback for browsers and PWAs
- OCR text correction and recognized-region selection
- Send-to-Encrypt, Decrypt, or Analyze actions
- Local processing by default; no cloud OCR service or API key is required

### Batch jobs and recipes

- Import `.txt` and `.csv` files
- Preview CSV mappings and use global or per-row cipher settings
- Validate rows independently and track pending, successful, warning, and failed counts
- Chunk processing, progress reporting, cancellation, correction, and retry
- Export new CSV or TXT results without overwriting the source file
- Build editable local Recipes with visible intermediate outputs

### Secure Lab and utilities

- AES-256-GCM through the Web Crypto API
- PBKDF2-HMAC-SHA-256 with 310,000 iterations
- Fresh random salt and IV for every encryption
- Versioned portable payloads and generic authentication-failure messages
- UTF-8-safe Base64, hexadecimal, and binary conversion
- SHA-256 with an explicit one-way warning

### Local app experience

- Home, Workspace, Scan, Analyze, and Library primary destinations
- Interactive lessons with simple and technical views
- QR generation and compatible payload scanning where supported
- Opt-in IndexedDB history with individual and bulk deletion
- Preferences-backed settings and draft preservation
- Animated light/dark theme switch with reduced-motion support
- Responsive mobile-first UI, keyboard focus states, and safe-area handling
- Installable offline PWA with route-level feature loading

## History and saved data

History is implemented and deliberately disabled by default. This prevents the app from retaining plaintext or ciphertext until the user explicitly opts in.

To enable it:

1. Open the **Settings** gear in the app header, or choose **History settings** from Library.
2. Enable **Allow explicit Save actions to write local history**.
3. Choose a retention period.
4. Press **Save preferences**.
5. Return to Workspace and use **Save** on a generated result.

Saved cipher records are written to the local `ciphergrid-local` IndexedDB database and appear under **Library → Saved results**. Each record contains the algorithm, operation, input, output, and creation time. Users can delete individual records, clear all history, or clear all structured local records. AES passphrases are never stored.

## Technology stack

| Area | Technology |
| --- | --- |
| UI | Ionic Vue 8, Vue 3 Composition API, TypeScript |
| Build | Vite 8, Vue TSC |
| State | Pinia |
| Routing | Ionic Vue Router |
| Native runtime | Capacitor 8 |
| Persistence | IndexedDB for records, Capacitor Preferences for settings |
| Modern crypto | Web Crypto API |
| Native OCR | `@jcesarmobile/capacitor-ocr` |
| Browser OCR | `tesseract.js` with locally copied English data |
| Tests | Vitest and jsdom |
| PWA | `vite-plugin-pwa` and Workbox |

## Requirements

For web development:

- Node.js 22 LTS
- npm, using the committed `package-lock.json`
- A modern browser with Web Crypto support

For Android development:

- Android Studio or Android command-line tools
- Android SDK 36
- Temurin Java 21
- A configured `ANDROID_HOME` or Android Studio-managed SDK

Capacitor 8 in this repository is built with Java 21. Do not copy Java 17 from older Capacitor workflows.

## Installation

Clone the repository, install the locked dependencies, and start Vite:

```bash
git clone <repository-url>
cd CypherGrid
npm ci
npm run dev
```

Open the local URL printed by Vite. The first launch shows onboarding; it can be reopened from the compass button in the Home header.

The npm postinstall script copies the packaged Tesseract English model from `@tesseract.js-data/eng` to `public/tessdata`. That generated model file is intentionally ignored by Git because it can be recreated from the locked dependency.

To create and preview a production build:

```bash
npm run build
npm run preview
```

Use `npm install <package>` only when intentionally changing dependencies. Use `npm ci` for clean, reproducible installs and CI parity.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run typecheck` | Run strict Vue and TypeScript checking |
| `npm run test -- --run` | Run the Vitest suite once |
| `npm run test` | Start Vitest in its default interactive mode |
| `npm run build` | Type-check and build the production PWA |
| `npm run preview` | Serve the built `dist` directory locally |
| `npm run format` | Apply ESLint auto-fixes where supported |
| `npx cap sync android` | Copy the current web build and update Android plugins |
| `npx cap open android` | Open the native project in Android Studio |

## Application structure

```text
src/
  components/
    common/                 shared shell and theme controls
  models/                   discriminated cipher and feature contracts
  pages/                    lazy-loaded feature screens
  router/                   Ionic Vue routes and onboarding guard
  services/
    analysis/               statistics and deterministic ranking
    ciphers/                pure algorithms and registry
    files/                  CSV/TXT parsing and batch engine
    ocr/                    native and browser OCR adapters
    qr/                     versioned QR helpers
    recipes/                visible workflow execution
    secure/                 Web Crypto AES-256-GCM
    storage/                IndexedDB persistence
    utilities/              encoding and hashing
  stores/                   Pinia settings and workspace drafts
  tests/                    Vitest suites
  theme/                    shared field-terminal design tokens

android/                    generated and maintained Capacitor Android project
public/assets/              logo and application artwork
scripts/copy-ocr-data.mjs   reproducible local OCR-data copy
.github/workflows/          verification and Android artifact workflow
```

Path aliases use TypeScript `paths` and the matching Vite alias. The project does not use the deprecated TypeScript `baseUrl` option.

## Android development

Build the web application before synchronizing it into Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

Command-line debug build on macOS or Linux:

```bash
cd android
./gradlew test assembleDebug
```

On Windows PowerShell:

```powershell
cd android
./gradlew.bat test assembleDebug
```

The debug APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Run `npm run build` and `npx cap sync android` again whenever web assets or Capacitor plugins change.

Launcher icons, adaptive foregrounds, PWA artwork, and Android splash images are derived from `public/assets/ciphergrid-logo.png`. After changing the source logo, regenerate the platform artwork on Windows with:

```powershell
./scripts/generate-brand-assets.ps1
```

### Physical-device OCR checklist

CI verifies compilation and packages the native OCR dependency, but it cannot prove camera behavior or OCR accuracy. Test on a physical Android device before a release:

1. Deny camera permission and confirm the app shows a recoverable error.
2. Grant permission and capture printed English, Filipino, and cipher-text samples.
3. Repeat with punctuation, mixed case, rotation, low light, glare, and slight blur.
4. Select the same samples from the gallery and compare recognized blocks.
5. Disable networking, clear app storage, relaunch, and verify bundled-model OCR.
6. Correct recognized text, select a subset, and send it to Encrypt, Decrypt, and Analyze.

On iOS, add the platform on macOS with `npx cap add ios`, then repeat the permission, orientation, and Apple Vision checks on a physical device.

## OCR and offline behavior

- **Android:** `@jcesarmobile/capacitor-ocr` 0.3.0 packages `com.google.mlkit:text-recognition:16.0.1`, including the Latin-script model in the application.
- **iOS:** the same adapter uses Apple Vision.
- **Web/PWA:** `tesseract.js` is dynamically imported only when browser OCR begins. Its English model is copied locally and included in the service-worker cache.
- UI components depend on the project `OcrService` contract, not directly on the native plugin.
- Images and recognized text are not uploaded by the standard OCR path.
- PWA offline availability begins after one successful load and service-worker installation.

## Testing and quality checks

Run the same web checks used by CI before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```

If Android-related code, dependencies, or generated web assets changed, also run:

```bash
npx cap sync android
cd android
./gradlew test assembleDebug
```

The unit tests cover published vectors, encryption/decryption round trips, invalid keys, empty input, punctuation, mixed case, Unicode behavior, padding conventions, AES authentication and randomness, cryptanalysis helpers, and batch mapping/failure isolation.

Reference vectors include:

- Caesar: `HELLO`, shift `3` → `KHOOR`
- Vigenère: `ATTACKATDAWN`, key `LEMON` → `LXFOPVEFRNHR`
- Atbash: `HELLO` → `SVOOL`
- Affine: `AFFINECIPHER`, `a=5`, `b=8` → `IHHWVCSWFRCP`
- Rail Fence: `WEAREDISCOVEREDFLEEATONCE`, rails `3` → `WECRLTEERDSOEEFEAOCAIVDEN`
- Playfair: key `PLAYFAIR EXAMPLE`, input `HIDETHEGOLDINTHETREESTUMP` → `BMODZBXDNABEKUDMUIXMMOUVIF`
- Hill: key `GYBNQKURP`, input `ACT` → `POH`

## Continuous integration and releases

The `Verify and Build Android` workflow runs for pushes and pull requests targeting `main`, plus manual dispatches. It:

1. Installs locked dependencies with Node.js 22.
2. Configures Temurin Java 21 and the Android SDK.
3. Runs linting, type-checking, Vitest, and the production web build.
4. Synchronizes Capacitor and verifies copied web assets.
5. Runs Gradle tests and builds a versioned debug APK.
6. Uploads the debug APK for 14 days.

The current workflow does not require repository secrets. Gradle signs debug APKs with its automatically generated debug key, which is sufficient for development, classroom testing, and direct installation on test devices.

A private release keystore is needed only when publishing a production build to an app store or maintaining upgrade compatibility for released installations. Release signing is intentionally not configured yet. When distribution is planned, create and protect a project-owned keystore, configure encrypted repository secrets, and document the recovery/ownership process before adding a release job. Never commit keystores, passwords, or `android/local.properties`.

## Batch CSV

Download the template in the app or start with:

```csv
text,algorithm,operation,key,shift,rails,a,b
"KHOOR",caesar,decrypt,,3,,,
"ATTACK AT DAWN",vigenere,encrypt,LEMON,,,,
```

Supported algorithm identifiers are `caesar`, `vigenere`, `atbash`, `affine`, `rail-fence`, `columnar`, `playfair`, `hill`, and `autokey`. Per-row values override the fallback configuration. Imported values remain plain text and are never rendered as HTML.

## Contributing

Contributions should preserve algorithm correctness, privacy, accessibility, and the distinction between educational ciphers and modern encryption.

### Development workflow

1. Read this README before making broad changes.
2. Create a focused branch from the current `main` branch.
3. Install dependencies with `npm ci`.
4. Keep cipher, analyzer, parser, and scoring logic in pure TypeScript services.
5. Add or update tests for every behavior change and regression fix.
6. Run the complete verification commands before submitting a pull request.
7. Include screenshots for visible UI changes at a mobile width and in both themes.
8. Explain any native behavior that could not be exercised locally.

### Code expectations

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Preserve strict typing and discriminated unions; do not introduce `any` without a compelling boundary reason.
- Keep route features lazy-loaded and browser-safe.
- Centralize user-facing validation instead of duplicating error logic in components.
- Do not log plaintext keys, AES passphrases, imported documents, or OCR content.
- Do not call classical ciphers secure or describe Base64 as encryption.
- Use rectangular, accessible controls consistent with the field-terminal design system.
- Preserve minimum 44×44 px touch targets, focus-visible states, reduced-motion behavior, and screen-reader labels.
- Avoid unrelated dependency upgrades or generated secrets.

### Pull request checklist

- [ ] The change has a clear scope and no unrelated rewrites.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test -- --run` passes.
- [ ] `npm run build` passes.
- [ ] Android was synchronized and built when native-facing files changed.
- [ ] New algorithms or transformations include known vectors and round-trip tests.
- [ ] Privacy/security wording remains accurate.
- [ ] Documentation and screenshots are updated where needed.

## Privacy and security boundaries

- CipherGrid has no account requirement, backend, analytics service, Firebase dependency, cloud OCR API, or application secret key.
- History is local, optional, and user-controllable.
- AES passphrases are never persisted.
- QR payloads omit secret key material by default and warn before including it.
- Imported filenames and content are treated as untrusted text.
- Native sharing and file export happen only after explicit user action.
- Authentication failures in Secure Lab do not reveal whether a passphrase, payload, or ciphertext component was wrong.

Report security-sensitive issues privately to the repository maintainer rather than including secrets or exploit details in a public issue.

## Known limitations

- Most classical-cipher arithmetic targets ASCII `A-Z`. Caesar, Vigenère, Atbash, Affine, and Autokey preserve non-ASCII characters; Playfair and Hill intentionally normalize to `A-Z`.
- Playfair shares I/J and retains decrypted filler characters rather than silently removing a legitimate `X` or `Q`.
- Hill adds visible `X` padding and normalizes formatting.
- Columnar Transposition preserves exact length without padding and uses stable left-to-right duplicate-key ordering.
- Browser QR image scanning depends on `BarcodeDetector`; unsupported browsers retain QR generation and manual payload entry.
- The bundled web OCR model is English. It can recognize Filipino Latin-script text, but no dedicated Filipino model is packaged.
- Camera behavior, OCR accuracy, device sharing, and permission recovery require physical-device testing.
- A successful CI build proves compilation and packaging, not camera quality or OCR accuracy.

## Troubleshooting

### TypeScript reports that `baseUrl` is deprecated

The current `tsconfig.json` does not use `baseUrl`. The `@/*` alias is resolved through TypeScript `paths` and the matching Vite alias. If the warning remains, restart the IDE TypeScript server so it reloads the project configuration.

### The Android SDK cannot be found

Open the project through Android Studio or set `ANDROID_HOME` to the installed SDK. Local SDK paths belong in `android/local.properties`, which is ignored by Git.

### Browser OCR cannot find its model

Run `npm ci` or `npm install` again. The postinstall script should recreate:

```text
public/tessdata/eng.traineddata.gz
```

### Native changes are missing from Android

Rebuild and synchronize before reopening Android Studio:

```bash
npm run build
npx cap sync android
```

### Onboarding no longer appears automatically

Onboarding completion is stored locally. Use the compass button in the Home header, or clear the `cg-onboarding` key from browser local storage during development.

### Vite reports a large chunk warning

The warning is non-fatal. Feature routes and browser OCR are lazy-loaded; review bundle changes before adding large dependencies rather than increasing the warning threshold without investigation.
