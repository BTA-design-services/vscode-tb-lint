# TB_LINT VS Code Extension - Setup & Quickstart Guide

## 30-Second Quick Start

### 1. Prerequisites Check
```bash
# Verify Python 3.6+
python3 --version

# Verify VS Code 1.75+
code --version
```

### 2. Clone TB_LINT Framework
```bash
cd ~/your-workspace
git clone https://github.com/BTA-design-services/tb_lint.git
```

### 3. Install Extension (Development)
```bash
git clone <this-extension-repo>
cd vscode-tb-lint
npm install
npm run watch
# Press F5 to launch debug session
```

### 4. Configure Extension
Add to `.vscode/settings.json`:
```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/tb_lint/configs/lint_config.json"
}
```

### 5. Start Using
- Open any `.sv` or `.svh` file
- Extension auto-lints on save
- Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) to manual lint

---

## Complete Installation Guide

### Step 1: Install VS Code (if needed)

Download from: https://code.visualstudio.com/

### Step 2: Install Python 3.6+

**Windows**:
- Download from https://www.python.org/
- During installation, check "Add Python to PATH"
- Verify: `python --version` or `python3 --version`

**macOS**:
```bash
# Using Homebrew
brew install python3

# Verify
python3 --version
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt-get install python3

# Fedora
sudo dnf install python3

# Verify
python3 --version
```

### Step 3: Clone TB_LINT Framework

Choose a location in your workspace:
```bash
cd /path/to/your/workspace
git clone https://github.com/BTA-design-services/tb_lint.git
```

### Step 4: Install TB_LINT Dependencies

```bash
cd tb_lint

# Install Python dependencies (if any)
pip3 install -r requirements.txt

# Test TB_LINT installation
python3 tb_lint.py --list-linters
```

### Step 5: Install VS Code Extension

#### Option A: Development Mode (Recommended for Testing)

```bash
# Clone this extension repository
git clone <vscode-tb-lint-repo>
cd vscode-tb-lint

# Install Node dependencies
npm install

# Watch for TypeScript changes
npm run watch

# In VS Code: Press F5 to launch debug session
```

#### Option B: Build VSIX Package

```bash
# From vscode-tb-lint directory
npm install
npm run compile

# Install the .vsix file
code --install-extension dist/tb-lint-1.0.0.vsix
```

#### Option C: Manual Installation (Linux/macOS)

```bash
# Create extensions directory if needed
mkdir -p ~/.vscode/extensions/tb-lint

# Copy extension files
cp -r vscode-tb-lint/dist/* ~/.vscode/extensions/tb-lint/

# Reload VS Code
```

### Step 6: Configure Extension

#### Method 1: Settings UI

1. Open VS Code
2. Press `Ctrl+,` (or `Cmd+,` on Mac)
3. Search for "tb_lint"
4. Configure settings:
   - `tb_lint.pythonPath`: Set to `python3` or `python`
   - `tb_lint.tbLintPath`: Point to `tb_lint/tb_lint.py` in workspace
   - `tb_lint.configFile`: Optional, point to `tb_lint/configs/lint_config.json`

#### Method 2: settings.json (Recommended)

Create or edit `.vscode/settings.json` in workspace root:

```json
{
  "tb_lint.pythonPath": "python3",
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/tb_lint/configs/lint_config.json",
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false,
  "tb_lint.autoShowOutput": true
}
```

**Variable Substitution**:
- `${workspaceFolder}`: Root of open workspace
- `${userHome}`: User home directory
- `${pathSeparator}`: OS-specific path separator

---

## Basic Usage

### Automatic Linting

Files automatically lint when:
1. **Opened** (if `enableOnOpen` is true)
2. **Saved** (if `enableOnSave` is true)
3. **Modified** (if `enableOnChange` is true, with debounce)

### Manual Linting Commands

**Lint Current File**
- Command Palette: `Ctrl+Shift+P` → "TB_LINT: Lint Current File"
- Keyboard: `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (macOS)

**Lint Workspace**
- Command Palette: `Ctrl+Shift+P` → "TB_LINT: Lint Workspace"

**Clear Diagnostics**
- Command Palette: `Ctrl+Shift+P` → "TB_LINT: Clear Diagnostics"

### Viewing Results

**Problems Panel**
- View → Problems (or `Ctrl+Shift+M`)
- Shows all violations with file, line, column, severity
- Click any violation to jump to that location

**Output Channel**
- View → Output → TB_LINT
- Shows detailed logs including:
  - Rule IDs
  - Violation messages
  - Timestamps
  - Execution status

**Inline Squiggles**
- Red squiggle: Error
- Yellow squiggle: Warning
- Blue squiggle: Information
- Hover over squiggle for full message

---

## Configuration Examples

### Basic Configuration (Minimal)

```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py"
}
```

### Production Configuration (Recommended)

```json
{
  "tb_lint.pythonPath": "python3",
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/tb_lint/configs/lint_config.json",
  "tb_lint.enableOnOpen": true,
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false,
  "tb_lint.debounceDelay": 1000,
  "tb_lint.autoShowOutput": false
}
```

### Performance Configuration (Large Projects)

```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false,
  "tb_lint.debounceDelay": 2000,
  "tb_lint.autoShowOutput": false
}
```

### Windows Configuration

```json
{
  "tb_lint.pythonPath": "python",
  "tb_lint.tbLintPath": "${workspaceFolder}\\tb_lint\\tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}\\tb_lint\\configs\\lint_config.json"
}
```

---

## Troubleshooting

### Problem: Extension doesn't appear to be working

**Check 1: Extension is enabled**
- Open Command Palette: `Ctrl+Shift+P`
- Search: "Extensions: Show Installed"
- Look for "TB_LINT"
- Ensure it's not disabled

**Check 2: Output channel**
- View → Output → TB_LINT
- Check for error messages
- Look for paths and Python execution details

**Check 3: Manual TB_LINT test**
```bash
# Test from terminal
cd /path/to/tb_lint
python3 tb_lint.py -f /path/to/file.sv

# Should produce output without errors
```

### Problem: "TB_LINT not found"

**Solution 1: Check path configuration**
- Verify `tb_lint.tbLintPath` in settings
- Use absolute path: `/home/user/workspace/tb_lint/tb_lint.py`

**Solution 2: Verify TB_LINT exists**
```bash
ls -la ~/workspace/tb_lint/tb_lint.py
```

**Solution 3: Use full Python path**
```bash
# Find Python location
which python3
# Update tb_lint.pythonPath in settings
```

### Problem: "Python not found" or "command not found"

**Windows**:
- Open Command Prompt: `cmd.exe`
- Run: `python --version`
- If not found, reinstall Python with "Add to PATH" checked

**macOS/Linux**:
```bash
# Find Python
which python3
# Update tb_lint.pythonPath to full path: /usr/bin/python3
```

### Problem: Extension slow or freezes editor

**Solution 1: Disable on-change linting**
```json
{
  "tb_lint.enableOnChange": false
}
```

**Solution 2: Increase debounce delay**
```json
{
  "tb_lint.debounceDelay": 3000
}
```

**Solution 3: Disable auto output**
```json
{
  "tb_lint.autoShowOutput": false
}
```

### Problem: No violations found (but expecting some)

**Check 1: Configuration file loaded**
- Verify `tb_lint.configFile` path is correct
- Test TB_LINT directly: `python3 tb_lint.py -f file.sv -c config.json`

**Check 2: Rules enabled in config**
- Open `lint_config.json`
- Verify NaturalDocs and Verible linters are enabled
- Check that rules you expect are not disabled

**Check 3: File type supported**
- Extension only lints `.sv`, `.svh`, `.v`, `.vh`
- Check file extension

---

## Testing the Extension

### Test 1: Simple Functionality

1. Create a test file `test.sv`:
```systemverilog
module test_module (
    input clk
);
    // Missing documentation
endmodule
```

2. Open file in VS Code
3. Should see violations in Problems panel
4. Hover over squiggle to see message

### Test 2: Workspace Linting

1. Create multiple `.sv` files with violations
2. Open Command Palette: `Ctrl+Shift+P`
3. Select "TB_LINT: Lint Workspace"
4. Check Problems panel for all violations

### Test 3: Output Channel

1. Lint a file
2. View → Output → TB_LINT
3. Verify detailed log output with timestamps

---

## Performance Optimization

### For Large Projects

**Reduce linting frequency**:
```json
{
  "tb_lint.enableOnChange": false,
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnSave": true
}
```

**Use keyboard shortcut only**:
```json
{
  "tb_lint.enableOnChange": false,
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnSave": false
}
```

**Increase debounce delay**:
```json
{
  "tb_lint.debounceDelay": 5000
}
```

### For Small Projects

**Real-time feedback**:
```json
{
  "tb_lint.enableOnChange": true,
  "tb_lint.debounceDelay": 500,
  "tb_lint.autoShowOutput": true
}
```

---

## Next Steps

1. **Customize TB_LINT Rules**: Edit `tb_lint/configs/lint_config.json`
2. **Add Custom Rules**: Follow TB_LINT documentation for custom rule development
3. **Integrate with CI/CD**: Use TB_LINT command-line interface in build pipelines
4. **Team Settings**: Share `.vscode/settings.json` via version control

---

## Support & Resources

**TB_LINT Framework**:
- GitHub: https://github.com/BTA-design-services/tb_lint
- Docs: See README_MODULAR.md in framework repo

**VS Code Extension API**:
- Documentation: https://code.visualstudio.com/api

**Verible**:
- GitHub: https://github.com/chipsalliance/verible
- Docs: https://chipsalliance.github.io/verible/

**Report Issues**:
- GitHub: https://github.com/BTA-design-services/vscode-tb-lint/issues

---

## Keyboard Shortcuts Reference

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Lint Current File | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Open Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Show Problems Panel | `Ctrl+Shift+M` | `Cmd+Shift+M` |
| Show Output Channel | `Ctrl+Shift+U` | `Cmd+Shift+U` |
| Go to Line | `Ctrl+G` | `Cmd+G` |

---

**Version**: 1.0.0  
**Last Updated**: November 2025