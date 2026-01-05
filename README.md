![BTA Logo](./logo.png) 


# [BTA Design Services](https://www.linkedin.com/company/bta-design-services-inc-/about/) TB_LINT VS Code Extension
**Version**: 0.0.22

## BTA Design Design Verification open-source initiative projects:

- [TB_LINT](https://github.com/BTA-design-services/tb_lint)
- [VS Code Extension](https://github.com/BTA-design-services/vscode-tb-lint)


## Overview

This extension brings powerful linting capabilities directly into your IDE, integrating **NaturalDocs** and **Verible** linters through the TB_LINT framework. It provides real-time feedback, inline diagnostics, and workspace-wide validation to ensure your design and verification code meets high-quality standards.

## Features

- **Real-time Linting**: Automatically lint SystemVerilog/Verilog files on open, save, or as you type.
- **Multiple Linting Engines**: Harnesses the power of NaturalDocs and Verible.
- **Inline Diagnostics**: Violations displayed as inline diagnostics (squiggles) in the editor.
- **Setup Verification**: Built-in command to verify your environment configuration.
- **Output Channel**: Detailed linting output with timestamps and rule information.
- **Workspace Linting**: Lint all SystemVerilog/Verilog files in the workspace at once.
- **Configurable**: Support for custom TB_LINT configuration files and flexible extension settings.
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux.

---

## Installation

### Prerequisites

1.  **VS Code**: Version 1.75.0 or later.
2.  **Python 3.6+**: Required to run the TB_LINT framework.
3.  **TB_LINT Framework**:
    ```bash
    git clone https://github.com/BTA-design-services/tb_lint.git
    ```

### Quick Start

1.  **Install the Extension**:
    - Download the `.vsix` file or build from source.
    - Run `code --install-extension tb-lint-0.1.0.vsix`.

2.  **Enable the Extension in VS Code**:
    - Open VS Code.
    - Go to the Extensions view by clicking the Extensions icon in the Activity Bar (left sidebar) or press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).
    - In the Extensions view, search for "TB_LINT" or "tb-lint".
    - Find the extension in the list and click the **Enable** button (or **Reload** if it's already installed but disabled).
    - If the extension was just installed, you may need to reload VS Code. Click the **Reload** button when prompted, or restart VS Code manually.
    - To verify the extension is enabled, check that it appears in the "Enabled" section of the Extensions view (not in "Disabled").

3.  **Configure Paths**:
    Add the following to your `.vscode/settings.json`:
    ```json
    {
      "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
      "tb_lint.configFile": "${workspaceFolder}/tb_lint/configs/lint_config.json"
    }
    ```

4.  **Verify Setup**:
    - Open the Command Palette (`Ctrl+Shift+P`).
    - Run `TB_LINT: Verify Setup`.

---

## Configuration

Configure TB_LINT in VS Code settings (`Ctrl+,`) or directly in `.vscode/settings.json`.

### Essential Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `tb_lint.pythonPath` | `python3` | Path to Python executable. Use `python` on Windows. |
| `tb_lint.tbLintPath` | `tb_lint.py` | Path to `tb_lint.py` file or directory containing it. |
| `tb_lint.veriblePath` | `""` | Path to Verible installation directory (VERIBLE_HOME) or executable. |
| `tb_lint.configFile` | `""` | Optional path to `lint_config.json`. |

### Behavior Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `tb_lint.enableOnOpen` | `true` | Lint files when opened. |
| `tb_lint.enableOnSave` | `true` | Lint files when saved. |
| `tb_lint.enableOnChange` | `false` | Lint files as you type (with debounce). |
| `tb_lint.debounceDelay` | `1000` | Delay in ms for on-change linting. |
| `tb_lint.autoShowOutput` | `true` | Automatically show output channel when linting. |

### Example Configuration (Production)

```json
{
  "tb_lint.pythonPath": "python3",
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/configs/lint_config.json",
  "tb_lint.enableOnOpen": true,
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false,
  "tb_lint.autoShowOutput": false
}
```

---

## Usage

### Manual Linting

-   **Lint Current File**:
    -   Command: `TB_LINT: Lint Current File`
    -   Shortcut: `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (macOS)
-   **Lint Workspace**:
    -   Command: `TB_LINT: Lint Workspace`
    -   Lints all `.sv`, `.svh`, `.v`, `.vh` files.
-   **Clear Diagnostics**:
    -   Command: `TB_LINT: Clear Diagnostics`

### Viewing Results

1.  **Problems Panel** (`Ctrl+Shift+M`): Shows all violations with file, line, column, and severity. Click to jump to the location.
2.  **Inline Squiggles**: Red (Error), Yellow (Warning), Blue (Info). Hover to see the full message.
3.  **Output Channel**: View -> Output -> TB_LINT. Shows detailed logs and execution status.

---

## Troubleshooting

### Common Issues

| Problem | Solution |
| :--- | :--- |
| **TB_LINT not found** | Verify `tb_lint.tbLintPath` in settings. Ensure the file exists. |
| **Python not found** | Check `tb_lint.pythonPath`. Try using an absolute path (e.g., `/usr/bin/python3`). |
| **No violations** | Check if your `lint_config.json` enables the rules you expect. Verify file extension is supported. |
| **Extension slow** | Disable `enableOnChange` or increase `debounceDelay`. |

### Verify Setup Command

Use the built-in verification command to diagnose issues:
1.  Open Command Palette (`Ctrl+Shift+P`).
2.  Run `TB_LINT: Verify Setup`.
3.  Check the notification or Output channel for details.

---

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/BTA-design-services/vscode-tb-lint.git
cd vscode-tb-lint

# Install dependencies
npm install

# Compile
npm run compile

# Package
vsce package
```

## License

MIT License - Copyright (c) BTA Design Services

## Support

-   **TB_LINT Framework**: [GitHub Repository](https://github.com/BTA-design-services/tb_lint)
-   **VS Code Extension**: [GitHub Repository](https://github.com/BTA-design-services/vscode-tb-lint)
-   **Issues**: [Report a Bug](https://github.com/BTA-design-services/vscode-tb-lint/issues)

## About BTA  Design Services

[BTA Design Services Inc](https://www.linkedin.com/company/bta-design-services-inc-/about/) specializes in ASIC and FPGA design and verification services, custom IP development, embedded software, and DevOps capabilities creation.  We are able to do turnkey design, augment or enhance existing design teams, or deliver complete and verified IP blocks to spec.  There are no limits to how we engage with our customers, and we are proud of our ability to adapt.
