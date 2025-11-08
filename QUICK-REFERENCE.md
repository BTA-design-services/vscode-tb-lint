# TB_LINT VS Code Extension - Quick Reference Card

## Installation (One-Liner)

```bash
git clone https://github.com/BTA-design-services/vscode-tb-lint.git && cd vscode-tb-lint && npm install && npm run watch
# Press F5 to debug
```

## Configuration Template

Add to `.vscode/settings.json`:
```json
{
  "tb_lint.pythonPath": "python3",
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/tb_lint/configs/lint_config.json",
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false
}
```

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---|---|
| Lint Current File | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Open Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Show Problems | `Ctrl+Shift+M` | `Cmd+Shift+M` |

## Command Palette Commands

```
TB_LINT: Lint Current File
TB_LINT: Lint Workspace
TB_LINT: Clear Diagnostics
```

## Extension Features

✅ Real-time linting (open/save/type)
✅ Inline diagnostics with squiggles
✅ Problems panel integration
✅ Output channel with logs
✅ Workspace-wide linting
✅ Configurable behavior
✅ JSON output parsing
✅ Keyboard shortcuts
✅ Error handling
✅ Cross-platform (Windows/Mac/Linux)

## Supported File Types

- `.sv` - SystemVerilog source
- `.svh` - SystemVerilog headers
- `.v` - Verilog source
- `.vh` - Verilog headers

## Configuration Reference

```json
{
  "tb_lint.pythonPath": "python3",              // Python executable
  "tb_lint.tbLintPath": "tb_lint.py",           // Path to TB_LINT
  "tb_lint.configFile": "lint_config.json",     // TB_LINT config file
  "tb_lint.enableOnOpen": true,                 // Lint on file open
  "tb_lint.enableOnSave": true,                 // Lint on file save
  "tb_lint.enableOnChange": false,              // Lint on file change
  "tb_lint.debounceDelay": 1000,                // Debounce (milliseconds)
  "tb_lint.autoShowOutput": true                // Auto-show output channel
}
```

## Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| TB_LINT not found | Set correct path in settings, check file exists |
| Python not found | Add Python to PATH, or set full path |
| Slow extension | Disable `enableOnChange`, increase `debounceDelay` |
| No violations | Check config file, verify rules enabled |
| Extension doesn't start | Check output channel, look for errors |

## Performance Tips

1. **For development**: Enable `enableOnChange` with 500ms debounce
2. **For large projects**: Disable `enableOnChange`, use save-only
3. **For CI/CD**: Set `enableOnOpen: false`, only on save
4. **For notebooks**: Use manual commands with `Ctrl+Shift+L`

## Build & Package

```bash
npm install              # Install dependencies
npm run watch           # Watch TypeScript (development)
npm run compile         # Compile TypeScript
vsce package            # Create .vsix package
code --install-extension dist/tb-lint-1.0.0.vsix
```

## Architecture Overview

```
VS Code Extension (extension.ts)
    ├── Event Listeners
    │   ├── On File Open
    │   ├── On File Save
    │   └── On File Change (debounced)
    ├── Commands
    │   ├── Lint Current File
    │   ├── Lint Workspace
    │   └── Clear Diagnostics
    └── Diagnostics Engine
        ├── Spawn TB_LINT subprocess
        ├── Parse JSON/text output
        ├── Create violations
        └── Update Problems panel
```

## File Structure

```
vscode-tb-lint/
├── src/
│   └── extension.ts              # Main code
├── package.json                  # Manifest
├── tsconfig.json                 # TypeScript config
├── README-EXTENSION.md           # Full docs
├── SETUP-GUIDE.md               # Installation
├── USAGE-EXAMPLES.md            # Examples
└── IMPLEMENTATION.md            # Technical details
```

## Requirements

- VS Code 1.75+
- Python 3.6+
- TB_LINT framework installed
- Windows, macOS, or Linux

## Common Tasks

**Lint current file manually**:
```
Ctrl+Shift+L  (or Cmd+Shift+L on Mac)
```

**View all violations**:
```
Ctrl+Shift+M  (or Cmd+Shift+M on Mac)
→ View → Problems
```

**View extension logs**:
```
View → Output → TB_LINT
```

**Configure extension**:
```
Ctrl+,  (or Cmd+, on Mac)
→ Search "tb_lint"
```

**Lint entire workspace**:
```
Ctrl+Shift+P  →  "TB_LINT: Lint Workspace"
```

## Example Settings

### Development (Real-time feedback)
```json
{
  "tb_lint.enableOnChange": true,
  "tb_lint.debounceDelay": 500
}
```

### Production (Manual only)
```json
{
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnChange": false,
  "tb_lint.enableOnSave": false
}
```

### CI/CD Ready (Save only)
```json
{
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false,
  "tb_lint.autoShowOutput": false
}
```

## Output Format

Each violation shows:
- **File**: `test.sv`
- **Line**: Line number where violation occurs
- **Column**: Column number
- **Severity**: Error (red), Warning (yellow), Info (blue)
- **Message**: `[RULE_ID] Description of violation`

## Example Workflow

1. Open SystemVerilog file → Auto-linted
2. See violations in Problems panel
3. Click violation → Jump to location
4. Hover over squiggle → Read message
5. Fix code
6. Save file → Re-linted automatically
7. Violations disappear ✓

## Advanced Configuration

### Windows-specific
```json
{
  "tb_lint.pythonPath": "python",
  "tb_lint.tbLintPath": "C:\\path\\to\\tb_lint\\tb_lint.py"
}
```

### With workspace variables
```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tools/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/configs/lint.json"
}
```

### Performance-focused
```json
{
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnChange": false,
  "tb_lint.enableOnSave": true,
  "tb_lint.debounceDelay": 2000,
  "tb_lint.autoShowOutput": false
}
```

## Useful Links

- **Extension Repo**: https://github.com/BTA-design-services/vscode-tb-lint
- **TB_LINT Framework**: https://github.com/BTA-design-services/tb_lint
- **Verible**: https://github.com/chipsalliance/verible
- **VS Code API**: https://code.visualstudio.com/api

## Support

- **Issues**: GitHub Issues on repository
- **Documentation**: See README-EXTENSION.md, SETUP-GUIDE.md
- **Examples**: See USAGE-EXAMPLES.md

---

**Quick Reference Version**: 1.0  
**Last Updated**: November 8, 2025  
**For detailed info, see: README-EXTENSION.md**