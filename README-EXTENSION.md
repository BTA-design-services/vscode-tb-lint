# TB_LINT VS Code Extension

A VS Code extension that integrates the **TB_LINT** modular linting framework for real-time SystemVerilog and Verilog code quality validation.

## Features

- **Real-time Linting**: Automatically lint SystemVerilog/Verilog files on open, save, or as you type
- **Multiple Linting Engines**: Integrates NaturalDocs and Verible linters through TB_LINT
- **Inline Diagnostics**: Violations displayed as inline diagnostics in the editor
- **Output Channel**: Detailed linting output with timestamps and rule information
- **Workspace Linting**: Lint all SystemVerilog/Verilog files in the workspace
- **Configurable**: Support for custom TB_LINT configuration files
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### Prerequisites

1. **VS Code**: Version 1.75.0 or later
2. **Python 3.6+**: Required to run TB_LINT
3. **TB_LINT Framework**: Clone or copy to your workspace
   ```bash
   git clone https://github.com/BTA-design-services/tb_lint.git
   ```

### Installing the Extension

#### Option 1: Install from Marketplace (Future)
```
Search for "TB_LINT" in VS Code Extensions marketplace
```

#### Option 2: Install from Source
```bash
git clone <this-repository>
cd vscode-tb-lint
npm install
npm run compile
code --install-extension dist/tb-lint-1.0.0.vsix
```

#### Option 3: Development Mode
```bash
git clone <this-repository>
cd vscode-tb-lint
npm install
npm run watch
# Press F5 in VS Code to launch debug session
```

## Configuration

Configure TB_LINT in VS Code settings (`Ctrl+,` or `Cmd+,`):

### Essential Settings

**`tb_lint.pythonPath`** (default: `python3`)
- Path to Python executable
- Set to `python` on Windows if `python3` is not available

**`tb_lint.tbLintPath`** (default: `tb_lint.py`)
- Path to `tb_lint.py` script
- Can be absolute or relative to workspace root
- Extension searches workspace root if relative path provided

**`tb_lint.configFile`** (optional)
- Path to TB_LINT configuration file (`lint_config.json`)
- If not specified, TB_LINT uses its default configuration

### Behavior Settings

**`tb_lint.enableOnOpen`** (default: `true`)
- Lint files when opened

**`tb_lint.enableOnSave`** (default: `true`)
- Lint files when saved

**`tb_lint.enableOnChange`** (default: `false`)
- Lint files as you type (with debounce)
- Disable for large projects to improve responsiveness

**`tb_lint.debounceDelay`** (default: `1000`)
- Debounce delay in milliseconds for on-change linting
- Increase if linting is too frequent and slowing down editor

**`tb_lint.autoShowOutput`** (default: `true`)
- Automatically show TB_LINT output channel when linting

### Configuration Example

Add to `.vscode/settings.json`:

```json
{
  "tb_lint.pythonPath": "python3",
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/configs/lint_config.json",
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false
}
```

## Usage

### Manual Linting

**Lint Current File**
- Command: `TB_LINT: Lint Current File`
- Keyboard Shortcut: `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (macOS)
- Run from Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)

**Lint Workspace**
- Command: `TB_LINT: Lint Workspace`
- Lints all `.sv`, `.svh`, `.v`, `.vh` files in the workspace
- Results displayed in Problems panel

**Clear Diagnostics**
- Command: `TB_LINT: Clear Diagnostics`
- Clears all TB_LINT diagnostics from the editor

### Automatic Linting

Files are automatically linted when:
1. Opened (if `enableOnOpen` is true)
2. Saved (if `enableOnSave` is true)
3. Modified (if `enableOnChange` is true, with debounce)

### Viewing Results

**Problems Panel**
- View → Problems (or `Ctrl+Shift+M`)
- Shows all linting violations with severity levels
- Click to jump to violation location

**Output Channel**
- View → Output → TB_LINT
- Shows detailed linting logs with timestamps
- Includes rule IDs and detailed messages

**Inline Diagnostics**
- Violations shown with colored squiggles in editor
- Hover over squiggle to see full message
- Red = Error, Yellow = Warning, Blue = Info, Gray = Hint

## Supported File Types

- SystemVerilog: `.sv`, `.svh`
- Verilog: `.v`, `.vh`

## Error Messages

### "TB_LINT not found"
- Verify TB_LINT path in settings
- Check Python path is correct
- Ensure TB_LINT repository is cloned/copied to workspace

### "Failed to execute TB_LINT"
- Verify Python is installed: `python3 --version`
- Check TB_LINT dependencies are installed (run `tb_lint.py` manually to verify)
- Review Python path setting

### "No violations" (empty results)
- May indicate all checks passed
- Verify configuration file is correct
- Check TB_LINT output channel for details

## Troubleshooting

### Enable Debug Logging

Set in `.vscode/settings.json`:
```json
{
  "tb_lint.logLevel": "debug"
}
```

View logs in TB_LINT output channel.

### Manual TB_LINT Execution

Test TB_LINT directly in terminal:
```bash
# Lint single file
python3 tb_lint.py -f /path/to/file.sv

# Lint with config
python3 tb_lint.py -f /path/to/file.sv -c configs/lint_config.json

# Lint directory
python3 tb_lint.py /path/to/directory

# Get linter list
python3 tb_lint.py --list-linters
```

Compare output with extension results to isolate issues.

### Performance Issues

If linting is slow or freezes editor:
1. Disable `enableOnChange` in settings
2. Increase `debounceDelay` to 2000+ ms
3. Limit workspace size or use folder filters
4. Check if TB_LINT has many rules enabled

## Architecture

### Extension Components

- **Activation**: Triggers on SystemVerilog/Verilog language detection
- **Event Listeners**: Monitor file open, save, and change events
- **Linting Engine**: Spawns TB_LINT as subprocess with JSON output
- **Diagnostic Provider**: Converts TB_LINT output to VS Code diagnostics
- **Output Channel**: Displays detailed linting information

### Data Flow

```
File Event (open/save/change)
    ↓
Event Handler (debounce if on-change)
    ↓
Spawn TB_LINT subprocess
    ↓
Collect JSON output
    ↓
Parse violations
    ↓
Create VS Code Diagnostics
    ↓
Update Problems panel and inline squiggles
```

### Output Format Support

- **Primary**: JSON output from TB_LINT (`--json` flag)
- **Fallback**: Text-based parsing for backward compatibility

## Development

### Building from Source

```bash
# Clone repository
git clone <repo-url>
cd vscode-tb-lint

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run extension in debug mode
# Press F5 in VS Code
```

### Project Structure

```
vscode-tb-lint/
├── src/
│   └── extension.ts          # Main extension code
├── dist/                      # Compiled JavaScript
├── package.json              # Extension metadata
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

### Creating a Release Package

```bash
npm run compile
vsce package
# Creates tb-lint-1.0.0.vsix
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test thoroughly
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

### Issues

Report bugs or request features on GitHub:
[GitHub Issues](https://github.com/BTA-design-services/vscode-tb-lint/issues)

### Documentation

- **TB_LINT Framework**: [GitHub - BTA-design-services/tb_lint](https://github.com/BTA-design-services/tb_lint)
- **Verible**: [GitHub - chipsalliance/verible](https://github.com/chipsalliance/verible)
- **VS Code Extension API**: [code.visualstudio.com/api](https://code.visualstudio.com/api)

## Changelog

### Version 1.0.0
- Initial release
- File and workspace linting support
- Real-time diagnostics
- Configurable behavior
- Output channel with detailed logs
- Keyboard shortcuts for manual linting

## Related Projects

- **TB_LINT Framework**: https://github.com/BTA-design-services/tb_lint
- **Verible**: https://github.com/chipsalliance/verible
- **Saarthi AI Verification**: AI-driven formal verification engineering (complements this tool)