# murf32 — Marketplace Publishing & Distribution Guide

This guide details how to publish and distribute the **murf32** extension across all supported IDEs, including **Visual Studio Code**, **Antigravity IDE**, **Cursor**, and **Windsurf**.

---

## 1. Distribution Channels Overview

| Channel | Target IDEs | Cost | Authentication |
| :--- | :--- | :--- | :--- |
| **Visual Studio Marketplace** | Official Microsoft VS Code | **FREE ($0)** | Azure DevOps PAT |
| **Open VSX Registry** | Antigravity IDE, Cursor, Windsurf, VSCodium | **FREE ($0)** | Open VSX Access Token |
| **Direct VSIX Sideloading** | Any Chromium/Electron-based IDE | **FREE ($0)** | None (File download) |

---

## 2. Automated Publishing via GitHub Actions (Recommended)

The repository includes a ready-to-use CI/CD workflow at [`.github/workflows/publish-extension.yml`](../.github/workflows/publish-extension.yml).

### Setup:
1. Go to your GitHub repository: [github.com/arklabai/murf32](https://github.com/arklabai/murf32)
2. Go to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
3. Add the following secrets:
   - `VSCE_PAT`: Your Azure DevOps Personal Access Token.
   - `OVSX_TOKEN`: Your Open VSX Access Token.

### Triggering a Release:
1. Update the version in `package.json` (e.g., `0.1.0` -> `0.1.1`).
2. Create and push a git tag, or draft a GitHub Release:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
3. GitHub Actions will automatically:
   - Run tests and compile both webview and extension host
   - Package the `.vsix`
   - Publish live to Visual Studio Marketplace
   - Publish live to Open VSX
   - Attach the `.vsix` to the GitHub Release downloads.

---

## 3. Manual Publishing via CLI

### Prerequisites
Make sure dependencies are installed and the extension is built:
```bash
npm install
npm --prefix webview-ui install
npm run build:all
```

---

### Step A: Visual Studio Code Marketplace

1. **Create Publisher Account**:
   - Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
   - Sign in and register publisher ID: `arklabai`.

2. **Generate Personal Access Token (PAT)**:
   - Visit [dev.azure.com](https://dev.azure.com).
   - Click the User Settings gear / profile icon > **Personal Access Tokens**.
   - Click **+ New Token**.
   - Organization: Select **All accessible organizations**.
   - Scopes: Select **Custom defined** > click **Show all scopes**.
   - Locate **Marketplace** and check **Manage**.
   - Set expiration and click **Create**. Save your token safely.

3. **Publishing**:
   ```bash
   # Package and publish directly:
   npx @vscode/vsce publish -p <YOUR_AZURE_PAT>
   ```

---

### Step B: Open VSX Registry (Antigravity IDE & Cursor)

Because **Antigravity IDE**, **Cursor**, and **Windsurf** do not pull from Microsoft's proprietary marketplace, they query the Eclipse Open VSX registry:

1. **Create Account & Namespace**:
   - Go to [open-vsx.org](https://open-vsx.org).
   - Sign in using your GitHub account (`arklabai`).
   - Create or claim the namespace `arklabai`.

2. **Generate Access Token**:
   - In Open VSX, navigate to your profile > **Settings** > **Access Tokens**.
   - Generate a new token and copy it.

3. **Publishing**:
   ```bash
   # 1. Package the VSIX:
   npx @vscode/vsce package --no-git-tag-version

   # 2. Publish to Open VSX:
   npx ovsx publish murf32-*.vsix -p <YOUR_OVSX_TOKEN>
   ```

---

## 4. Local Sideloading (Testing & Internal Use)

To share builds before public marketplace approval:

1. **Package the file**:
   ```bash
   npx @vscode/vsce package --no-git-tag-version
   ```
   This generates `murf32-<version>.vsix`.

2. **Install on Mac**:
   ```bash
   # Antigravity IDE
   "/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide" --install-extension murf32-0.1.0.vsix --force

   # Visual Studio Code
   "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension murf32-0.1.0.vsix --force
   ```

3. **Install via IDE GUI**:
   - Open Extensions view (`Cmd+Shift+X`).
   - Click the `...` (Views and More Actions) menu in the top-right of the Extensions panel.
   - Choose **Install from VSIX...** and select `murf32-0.1.0.vsix`.

---

## 5. Maintenance Checklist

Before every new release:
- [ ] Increment version in [`package.json`](../package.json).
- [ ] Run `npm run build:all` to ensure zero compilation or bundler warnings.
- [ ] Test the VSIX locally with `npx @vscode/vsce package --no-git-tag-version`.
- [ ] Verify package size is under 150 KB (ensuring dev dependencies are ignored).
- [ ] Update changelog or release notes on GitHub.
