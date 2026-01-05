import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('TB_LINT');
    diagnosticCollection = vscode.languages.createDiagnosticCollection('tb_lint');

    context.subscriptions.push(diagnosticCollection);
    context.subscriptions.push(outputChannel);

    // Register for SystemVerilog files
    const supportedLanguages = ['systemverilog', 'verilog'];

    // Lint on file open
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            if (isSupportedFile(document)) {
                lintFile(document);
            }
        })
    );

    // Lint on file save
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            if (isSupportedFile(document)) {
                lintFile(document);
            }
        })
    );

    // Lint on file change (with debounce)
    let changeTimeout: NodeJS.Timeout;
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (isSupportedFile(event.document)) {
                clearTimeout(changeTimeout);
                changeTimeout = setTimeout(() => {
                    lintFile(event.document);
                }, 1000);
            }
        })
    );

    // Command to manually lint current file
    context.subscriptions.push(
        vscode.commands.registerCommand('tb_lint.lintCurrentFile', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isSupportedFile(editor.document)) {
                lintFile(editor.document);
            } else {
                vscode.window.showWarningMessage('No supported SystemVerilog/Verilog file open');
            }
        })
    );

    // Command to lint workspace
    context.subscriptions.push(
        vscode.commands.registerCommand('tb_lint.lintWorkspace', () => {
            lintWorkspace();
        })
    );

    // Command to clear diagnostics
    context.subscriptions.push(
        vscode.commands.registerCommand('tb_lint.clearDiagnostics', () => {
            diagnosticCollection.clear();
            outputChannel.appendLine('Cleared all TB_LINT diagnostics');
        })
    );

    // Command to verify setup
    context.subscriptions.push(
        vscode.commands.registerCommand('tb_lint.verifySetup', () => {
            verifySetup(true);
        })
    );

    outputChannel.appendLine('TB_LINT extension activated');

    // Verify setup on activation (silent mode)
    verifySetup(false);
}

async function verifySetup(showSuccess: boolean): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('tb_lint');
    const pythonPath = config.get<string>('pythonPath') || 'python3';
    const tbLintPath = config.get<string>('tbLintPath') || getTbLintPath();
    const veriblePath = config.get<string>('veriblePath', '');

    // Resolve tb_lint.py path
    const resolvedTbLintPath = resolveTbLintPath(tbLintPath);

    if (showSuccess) {
        outputChannel.show(true);
    }

    outputChannel.appendLine('\n--- Verifying Setup ---');
    outputChannel.appendLine(`Python Path: ${pythonPath}`);
    outputChannel.appendLine(`Configured TB_LINT Path: ${tbLintPath}`);
    outputChannel.appendLine(`Resolved Absolute Path: ${resolvedTbLintPath}`);
    outputChannel.appendLine(`Verible Path: ${veriblePath || '(not set - using PATH/VERIBLE_HOME)'}`);

    if (veriblePath && !fs.existsSync(veriblePath)) {
        const msg = `WARNING: Verible path configured but not found at '${veriblePath}'`;
        outputChannel.appendLine(msg);
        if (showSuccess) {
            vscode.window.showWarningMessage(`TB_LINT Warning: ${msg}`);
        }
    } else if (veriblePath) {
        outputChannel.appendLine(`Verible path verified: OK`);
    }

    // 1. Check Python
    try {
        const pythonProcess = spawn(pythonPath, ['--version']);
        pythonProcess.on('error', (err) => {
            const msg = `Python not found or invalid at '${pythonPath}': ${err.message}`;
            outputChannel.appendLine(msg);
            vscode.window.showErrorMessage(`TB_LINT Setup Error: ${msg}`);
        });
    } catch (e) {
        const msg = `Failed to spawn python: ${e}`;
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(`TB_LINT Setup Error: ${msg}`);
        return false;
    }

    // 2. Check tb_lint.py existence
    if (!fs.existsSync(resolvedTbLintPath)) {
        const msg = `tb_lint.py not found at '${resolvedTbLintPath}'. Please configure 'tb_lint.tbLintPath' in your settings.`;
        outputChannel.appendLine(msg);
        vscode.window.showErrorMessage(`TB_LINT Setup Error: ${msg}`);
        return false;
    }

    // 3. Check tb_lint.py execution
    return new Promise((resolve) => {
        const args = [resolvedTbLintPath, '--help'];
        const env = getTbLintEnv(veriblePath);
        const process = spawn(pythonPath, args, { cwd: path.dirname(resolvedTbLintPath), env });

        let stderr = '';

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                outputChannel.appendLine('TB_LINT execution verified: OK');
                if (showSuccess) {
                    vscode.window.showInformationMessage('TB_LINT setup verified successfully!');
                }
                resolve(true);
            } else {
                const msg = `tb_lint.py execution failed (code ${code}). Stderr: ${stderr}`;
                outputChannel.appendLine(msg);
                vscode.window.showErrorMessage(`TB_LINT Setup Error: ${msg}`);
                resolve(false);
            }
        });

        process.on('error', (err) => {
            const msg = `Failed to execute tb_lint.py: ${err.message}`;
            outputChannel.appendLine(msg);
            vscode.window.showErrorMessage(`TB_LINT Setup Error: ${msg}`);
            resolve(false);
        });
    });
}

function isSupportedFile(document: vscode.TextDocument): boolean {
    const supportedExtensions = ['.sv', '.svh', '.v', '.vh'];
    const ext = path.extname(document.fileName);
    return supportedExtensions.includes(ext) && document.uri.scheme === 'file';
}

async function lintFile(document: vscode.TextDocument): Promise<void> {
    const filePath = document.fileName;
    const config = vscode.workspace.getConfiguration('tb_lint');
    const pythonPath = config.get<string>('pythonPath') || 'python3';
    const tbLintPathConfig = config.get<string>('tbLintPath') || getTbLintPath();
    const tbLintPath = resolveTbLintPath(tbLintPathConfig);
    const configFile = config.get<string>('configFile');
    const veriblePath = config.get<string>('veriblePath', '');

    if (!fs.existsSync(tbLintPath)) {
        vscode.window.showErrorMessage(`TB_LINT not found at ${tbLintPath}`);
        return;
    }

    if (veriblePath && !fs.existsSync(veriblePath)) {
        vscode.window.showErrorMessage(`Verible path configured but not found: ${veriblePath}`);
        // We continue anyway, as it might be in PATH, but this warning is helpful
    }

    outputChannel.appendLine(`\n--- Linting: ${filePath} ---`);
    outputChannel.show(true);

    try {
        const diagnostics = await runTbLint(pythonPath, tbLintPath, document, configFile, veriblePath);
        diagnosticCollection.set(document.uri, diagnostics);

        const errorCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
        const warningCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length;

        outputChannel.appendLine(`Found ${errorCount} errors and ${warningCount} warnings`);
    } catch (error) {
        outputChannel.appendLine(`Error running TB_LINT: ${error}`);
        vscode.window.showErrorMessage(`TB_LINT error: ${error}`);
    }
}

async function runTbLint(
    pythonPath: string,
    tbLintPath: string,
    document: vscode.TextDocument,
    configFile?: string,
    veriblePath?: string
): Promise<vscode.Diagnostic[]> {
    const filePath = document.fileName;
    return new Promise((resolve, reject) => {
        const args = [tbLintPath, filePath];
        if (configFile) {
            args.push('-c', configFile);
        }
        args.push('--json');

        const env = { ...process.env };
        if (veriblePath) {
            if (fs.existsSync(veriblePath) && fs.statSync(veriblePath).isDirectory()) {
                env['VERIBLE_HOME'] = veriblePath;
            } else {
                env['VERIBLE_EXECUTABLE'] = veriblePath;
            }
        }

        const childProcess = spawn(pythonPath, args, { cwd: path.dirname(tbLintPath), env });
        let stdout = '';
        let stderr = '';

        childProcess.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        childProcess.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        childProcess.on('close', (code: number) => {

            try {
                const diagnostics = parseJsonOutput(stdout, document);
                resolve(diagnostics);
            } catch (error) {
                outputChannel.appendLine(`Failed to parse TB_LINT output: ${error}`);
                reject(error);
            }
        });

        childProcess.on('error', (error: Error) => {
            outputChannel.appendLine(`Spawn error: ${error.message}`);
            reject(`Failed to execute TB_LINT: ${error.message}`);
        });
    });
}

function parseJsonOutput(jsonOutput: string, document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const filePath = document.fileName;

    try {
        if (!jsonOutput.trim()) {
            return diagnostics;
        }



        // Extract JSON part from the output (skip text headers)
        const jsonStartIndex = jsonOutput.indexOf('{');
        const jsonEndIndex = jsonOutput.lastIndexOf('}');

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
            throw new Error('No JSON object found in output');
        }

        const cleanJson = jsonOutput.substring(jsonStartIndex, jsonEndIndex + 1);
        const results = JSON.parse(cleanJson);



        if (results.linters) {
            for (const [linterName, linterResult] of Object.entries(results.linters)) {
                const result = linterResult as any;
                if (result.violations) {
                    for (const violation of result.violations) {
                        // Only include violations for the requested file
                        // Note: tb_lint might return relative paths, so we might need loose matching
                        // But for now, let's include all since we usually lint one file
                        if (violation.file === filePath || filePath.endsWith(violation.file)) {
                            const diagnostic = violationToDiagnostic(violation, document);
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
        }
    } catch (error) {
        outputChannel.appendLine(`JSON parse error: ${error}`);
        // If JSON parsing fails, attempt to parse text output
        return parseTextOutput(jsonOutput, filePath);
    }

    return diagnostics;
}

function parseTextOutput(textOutput: string, filePath: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const lines = textOutput.split('\n');

    for (const line of lines) {
        const match = line.match(/(\w+):(\d+):(\d+):\s*(\w+):\s*(.+)/);
        if (match) {
            const [, , lineStr, colStr, severity, message] = match;
            const lineNum = parseInt(lineStr, 10) - 1;
            const colNum = parseInt(colStr, 10) - 1;

            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(lineNum, colNum, lineNum, colNum + 1),
                message,
                severityToVscodeSeverity(severity)
            );

            diagnostic.source = 'TB_LINT';
            diagnostics.push(diagnostic);
        }
    }

    return diagnostics;
}

function violationToDiagnostic(violation: any, document?: vscode.TextDocument): vscode.Diagnostic {
    const lineNum = (violation.line || 1) - 1;
    const colNum = (violation.column || 0) - 1; // Use 0 if column is missing/0, so we get -1

    const message = violation.message || 'Unknown violation';
    const ruleId = violation.rule_id || 'unknown';
    const severity = violation.severity || 'warning';

    let range: vscode.Range;

    if (document && (colNum < 0)) {
        // If column is not specified (0) or missing, highlight the whole line
        // Ensure lineNum is within bounds
        const safeLineNum = Math.min(Math.max(0, lineNum), document.lineCount - 1);
        range = document.lineAt(safeLineNum).range;
    } else {
        // Default to highlighting the specified column or first character
        const safeColNum = Math.max(0, colNum);
        range = new vscode.Range(lineNum, safeColNum, lineNum, safeColNum + 1);
    }

    const diagnostic = new vscode.Diagnostic(
        range,
        `[${ruleId}] ${message}`,
        severityToVscodeSeverity(severity)
    );

    diagnostic.source = 'TB_LINT';
    diagnostic.code = ruleId;

    return diagnostic;
}

function severityToVscodeSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity.toLowerCase()) {
        case 'error':
            return vscode.DiagnosticSeverity.Error;
        case 'warning':
            return vscode.DiagnosticSeverity.Warning;
        case 'info':
            return vscode.DiagnosticSeverity.Information;
        case 'hint':
            return vscode.DiagnosticSeverity.Hint;
        default:
            return vscode.DiagnosticSeverity.Warning;
    }
}

async function lintWorkspace(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const config = vscode.workspace.getConfiguration('tb_lint');
    const pythonPath = config.get<string>('pythonPath', 'python3');
    const tbLintPath = config.get<string>('tbLintPath', 'tb_lint.py');
    const configFile = config.get<string>('configFile', '');
    const veriblePath = config.get<string>('veriblePath', '');

    // Resolve paths
    const resolvedTbLintPath = resolveTbLintPath(tbLintPath);

    // Prepare environment
    const env = getTbLintEnv(veriblePath);

    outputChannel.appendLine(`\n--- Linting workspace: ${workspaceFolder.uri.fsPath} ---`);
    outputChannel.show(true);

    try {
        const args = [resolvedTbLintPath, workspaceFolder.uri.fsPath];
        if (configFile) {
            args.push('-c', configFile);
        }
        args.push('--json');

        const process = spawn(pythonPath, args, { env });
        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
            outputChannel.appendLine(`STDERR: ${data}`);
        });

        process.on('close', (code) => {
            try {
                const allDiagnostics = new Map<string, vscode.Diagnostic[]>();
                const results = JSON.parse(stdout);

                if (results.files) {
                    for (const [filePath, fileResults] of Object.entries(results.files)) {
                        const diagnostics: vscode.Diagnostic[] = [];
                        if ((fileResults as any).violations) {
                            for (const violation of (fileResults as any).violations) {
                                diagnostics.push(violationToDiagnostic(violation));
                            }
                        }
                        allDiagnostics.set(filePath, diagnostics);
                    }
                }

                for (const [filePath, diagnostics] of allDiagnostics) {
                    const uri = vscode.Uri.file(filePath);
                    diagnosticCollection.set(uri, diagnostics);
                }

                outputChannel.appendLine(`Workspace linting complete`);
                vscode.window.showInformationMessage('Workspace linting complete');
            } catch (error) {
                outputChannel.appendLine(`Error parsing workspace linting results: ${error}`);
            }
        });
    } catch (error) {
        outputChannel.appendLine(`Error linting workspace: ${error}`);
        vscode.window.showErrorMessage(`TB_LINT workspace error: ${error}`);
    }
}

function getTbLintPath(): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const localPath = path.join(workspaceFolder.uri.fsPath, 'tb_lint.py');
        if (fs.existsSync(localPath)) {
            return localPath;
        }
    }
    return 'tb_lint.py';
}

function resolveTbLintPath(tbLintPath: string): string {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
    let resolvedPath = path.isAbsolute(tbLintPath) ? tbLintPath : path.join(workspaceRoot, tbLintPath);

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        resolvedPath = path.join(resolvedPath, 'tb_lint.py');
    }

    return resolvedPath;
}

function getTbLintEnv(veriblePath: string): NodeJS.ProcessEnv {
    const env = { ...process.env };
    if (veriblePath && fs.existsSync(veriblePath)) {
        if (fs.statSync(veriblePath).isDirectory()) {
            // Check if binary exists in this directory or bin subdirectory
            const binName = process.platform === 'win32' ? 'verible-verilog-lint.exe' : 'verible-verilog-lint';

            const directPath = path.join(veriblePath, binName);
            const binSubPath = path.join(veriblePath, 'bin', binName);

            if (fs.existsSync(directPath)) {
                env['VERIBLE_EXECUTABLE'] = directPath;
            } else if (fs.existsSync(binSubPath)) {
                env['VERIBLE_EXECUTABLE'] = binSubPath;
            } else {
                // Fallback to VERIBLE_HOME if we can't find the binary explicitly
                env['VERIBLE_HOME'] = veriblePath;
            }
        } else {
            env['VERIBLE_EXECUTABLE'] = veriblePath;
        }
    }
    return env;
}

export function deactivate() {
    outputChannel.dispose();
    diagnosticCollection.dispose();
}