# TB_LINT Extension - Example Usage & Test Cases

## Example SystemVerilog Files for Testing

### Test Case 1: Missing File Header Documentation

**File**: `test_missing_header.sv`

```systemverilog
module counter (
    input clk,
    input rst,
    output [7:0] count
);

    reg [7:0] count_r;
    
    always @(posedge clk) begin
        if (rst)
            count_r <= 8'h0;
        else
            count_r <= count_r + 1;
    end
    
    assign count = count_r;

endmodule
```

**Expected Violations**:
- Missing file header documentation
- Module `counter` missing NaturalDocs documentation
- Signals missing documentation

---

### Test Case 2: Properly Documented Code (No Violations)

**File**: `test_properly_documented.sv`

```systemverilog
// ============================================================================
// FILE: test_properly_documented.sv
//
// DESCRIPTION: This file implements a simple counter with proper documentation.
//
// AUTHOR: Test Author
// DATE: November 8, 2025
// VERSION: 1.0
// ============================================================================

// <module>
//   <name>counter_documented</name>
//   <description>A simple 8-bit counter with asynchronous reset</description>
//   <parameter name="WIDTH" type="int" default="8">
//     Counter width in bits
//   </parameter>
// </module>
module counter_documented #(
    parameter WIDTH = 8
) (
    input clk,
    input rst_n,
    output [WIDTH-1:0] count
);

    // <signal>
    //   <name>count_r</name>
    //   <description>Internal counter register</description>
    // </signal>
    reg [WIDTH-1:0] count_r;
    
    // <function>
    //   <name>counter logic</name>
    //   <description>Increments counter on clock edge</description>
    // </function>
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            count_r <= {WIDTH{1'b0}};
        else
            count_r <= count_r + 1'b1;
    end
    
    assign count = count_r;

endmodule
```

**Expected Result**: No violations

---

### Test Case 3: Style and Formatting Issues

**File**: `test_style_violations.sv`

```systemverilog
module  bad_style(input clk,output [7:0] result);
reg [7:0] my_reg;
always @(posedge clk) begin
my_reg<=my_reg+1;
end
assign result = my_reg;
endmodule
```

**Expected Violations** (from Verible linter):
- Inconsistent spacing around operators
- Poor indentation
- Missing line breaks

---

### Test Case 4: Class Documentation

**File**: `test_class_docs.sv`

```systemverilog
// ============================================================================
// FILE: test_class_docs.sv
//
// DESCRIPTION: Verification components with class documentation
// ============================================================================

// <class>
//   <name>transaction</name>
//   <description>Basic transaction object for verification</description>
// </class>
class transaction;
    rand bit [31:0] data;
    bit [7:0] id;
    
    // <function>
    //   <name>print</name>
    //   <description>Prints transaction information</description>
    // </function>
    function void print();
        $display("Data: 0x%h, ID: 0x%h", data, id);
    endfunction
    
endclass
```

---

## Using the Extension

### Scenario 1: Real-Time Linting During Development

**Workflow**:
1. Open `test_missing_header.sv`
2. Extension auto-lints on file open (if enabled)
3. Problems panel shows violations
4. Hover over red squiggles to see details
5. View → Output → TB_LINT shows detailed logs

**Expected Output in Problems Panel**:
```
test_missing_header.sv (3 issues)
├─ Line 1: [FILE_HEADER_MISSING] File header documentation is missing
├─ Line 1: [MODULE_DOCS_MISSING] Module 'counter' documentation is missing
└─ Line 4: [VARIABLE_DOCS_MISSING] Signal 'count' documentation is missing
```

---

### Scenario 2: Batch Workspace Linting

**Setup**:
1. Create workspace with multiple `.sv` files
2. Configure extension in `.vscode/settings.json`
3. Open Command Palette: `Ctrl+Shift+P`
4. Select "TB_LINT: Lint Workspace"

**Result**:
- All `.sv` files in workspace linted
- Violations aggregated in Problems panel
- Can sort/filter by file, severity, rule

---

### Scenario 3: Manual Linting with Keyboard Shortcut

**Workflow**:
1. Edit file `counter.sv`
2. Press `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (macOS)
3. TB_LINT runs immediately on current file
4. Results displayed inline and in Problems panel

---

### Scenario 4: Review Violations and Fix Code

**Workflow**:
1. Open file with violations
2. Problems panel shows list of violations
3. Click violation → jumps to line
4. Read message in hover tooltip or output channel
5. Add proper documentation
6. File auto-lints on save
7. Violations disappear as code improves

**Example Fix**:

Before:
```systemverilog
module counter (
    input clk
);
```

After:
```systemverilog
// <module>
//   <name>counter</name>
//   <description>Simple counter module</description>
// </module>
module counter (
    input clk  // System clock
);
```

---

## Configuration Scenarios

### Development Setup (Real-Time Feedback)

```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.enableOnOpen": true,
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": true,
  "tb_lint.debounceDelay": 500,
  "tb_lint.autoShowOutput": true
}
```

**Benefits**:
- Immediate feedback as you code
- See violations before saving
- Quick iteration

---

### Review Setup (Manual Linting)

```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnSave": false,
  "tb_lint.enableOnChange": false,
  "tb_lint.autoShowOutput": true
}
```

**Benefits**:
- Lint only when explicitly requested
- No performance impact
- Manual control

---

### CI/CD Ready Setup (Save Only)

```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}/tb_lint/tb_lint.py",
  "tb_lint.configFile": "${workspaceFolder}/tb_lint/configs/lint_config.json",
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnSave": true,
  "tb_lint.enableOnChange": false,
  "tb_lint.autoShowOutput": false
}
```

**Benefits**:
- Lint checked before committing
- Clean when not actively editing
- Mirrors CI/CD pipeline

---

## Output Channel Examples

### Successful Lint Run

```
--- Linting: /workspace/counter.sv ---
Processing file with NaturalDocs Linter...
Processing file with Verible Linter...
Found 2 errors and 3 warnings
[MODULE_DOCS_MISSING] Module documentation missing (line 5)
[VARIABLE_DOCS_MISSING] Variable 'count_r' missing documentation (line 8)
[INDENTATION] Inconsistent indentation (line 12)
Linting complete at 2025-11-08 11:30:45
```

### File Not Found

```
--- Linting: /workspace/missing.sv ---
Error running TB_LINT: File not found: /workspace/missing.sv
```

### Python Not Found

```
--- Linting: /workspace/counter.sv ---
STDERR: python3: command not found
Error running TB_LINT: Failed to execute TB_LINT: Error: spawn python3 ENOENT
```

---

## Troubleshooting with Examples

### Issue: Rules Not Triggering

**Problem**:
- File missing documentation but no violations reported

**Diagnosis**:
1. Check if rules enabled in config
2. Test TB_LINT manually:
   ```bash
   cd tb_lint
   python3 tb_lint.py -f test_missing_header.sv --json
   ```
3. Compare manual output with extension output

**Solution**:
- Edit `configs/lint_config.json`
- Ensure NaturalDocs linter enabled
- Set desired rules to "enabled": true

---

### Issue: Slow Linting

**Problem**:
- Editor becomes sluggish while linting

**Diagnosis**:
- Check output channel for performance
- Monitor extension performance with developer tools

**Solution 1**: Reduce frequency
```json
{
  "tb_lint.enableOnChange": false,
  "tb_lint.enableOnOpen": false,
  "tb_lint.enableOnSave": true
}
```

**Solution 2**: Increase debounce
```json
{
  "tb_lint.debounceDelay": 2000
}
```

---

### Issue: Incorrect Path Resolution

**Problem**:
- "TB_LINT not found" error on Windows

**Diagnosis**:
- Paths may use different separators
- Relative paths not resolving

**Solution**:
```json
{
  "tb_lint.tbLintPath": "C:\\Users\\myuser\\workspace\\tb_lint\\tb_lint.py"
}
```

Or use workspace variable:
```json
{
  "tb_lint.tbLintPath": "${workspaceFolder}\\tb_lint\\tb_lint.py"
}
```

---

## Integration Examples

### With Git Pre-Commit Hook

1. Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Run TB_LINT on staged SystemVerilog files
python3 tb_lint.py -f $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(sv|svh)$')
if [ $? -ne 0 ]; then
    echo "TB_LINT failed - commit aborted"
    exit 1
fi
```

2. Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

3. VS Code extension provides visual feedback before commit

---

### With GitHub Actions

1. Create `.github/workflows/lint.yml`:
```yaml
name: TB_LINT

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Run TB_LINT
        run: |
          cd tb_lint
          python3 tb_lint.py . --json
```

2. VS Code extension shows same violations locally before pushing

---

## Quick Reference: Command Palette Commands

```
Ctrl+Shift+P (or Cmd+Shift+P on Mac) to open Command Palette

TB_LINT: Lint Current File
  - Keyboard: Ctrl+Shift+L or Cmd+Shift+L
  - Lints the active editor file

TB_LINT: Lint Workspace
  - Lints all .sv/.svh/.v/.vh files in workspace

TB_LINT: Clear Diagnostics
  - Removes all TB_LINT diagnostic markers
```

---

## Performance Benchmarks

### Typical Linting Times (Varies by System)

- Small file (< 500 lines): 200-500ms
- Medium file (500-2000 lines): 500ms-1s
- Large file (> 2000 lines): 1-3s
- Workspace (10-50 files): 5-30s

### Performance Tips

1. **Disable on-change linting** for projects > 100 files
2. **Increase debounce delay** to 1500-2000ms
3. **Use save-only linting** for large workspaces
4. **Disable auto output channel** to reduce overhead

---

**Version**: 1.0.0  
**Last Updated**: November 2025