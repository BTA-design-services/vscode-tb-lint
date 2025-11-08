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

    outputChannel.appendLine('TB_LINT extension activated');
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
    const tbLintPath = config.get<string>('tbLintPath') || getTbLintPath();
    const configFile = config.get<string>('configFile');

    if (!fs.existsSync(tbLintPath)) {
        vscode.window.showErrorMessage(`TB_LINT not found at ${tbLintPath}`);
        return;
    }

    outputChannel.appendLine(`\n--- Linting: ${filePath} ---`);
    outputChannel.show(true);

    try {
        const diagnostics = await runTbLint(pythonPath, tbLintPath, filePath, configFile);
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
    filePath: string,
    configFile?: string
): Promise<vscode.Diagnostic[]> {
    return new Promise((resolve, reject) => {
        const args = [tbLintPath, '-f', filePath];
        if (configFile) {
            args.push('-c', configFile);
        }
        args.push('--json');

        const process = spawn(pythonPath, args);
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
                const diagnostics = parseJsonOutput(stdout, filePath);
                resolve(diagnostics);
            } catch (error) {
                outputChannel.appendLine(`Failed to parse TB_LINT output: ${error}`);
                reject(error);
            }
        });

        process.on('error', (error) => {
            reject(`Failed to execute TB_LINT: ${error.message}`);
        });
    });
}

function parseJsonOutput(jsonOutput: string, filePath: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    try {
        if (!jsonOutput.trim()) {
            return diagnostics;
        }

        const results = JSON.parse(jsonOutput);

        if (!results.files || !results.files[filePath]) {
            return diagnostics;
        }

        const fileResults = results.files[filePath];

        if (fileResults.violations) {
            for (const violation of fileResults.violations) {
                const diagnostic = violationToDiagnostic(violation);
                diagnostics.push(diagnostic);
            }
        }
    } catch (error) {
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

function violationToDiagnostic(violation: any): vscode.Diagnostic {
    const lineNum = (violation.line || 1) - 1;
    const colNum = (violation.column || 1) - 1;
    const message = violation.message || 'Unknown violation';
    const ruleId = violation.rule_id || 'unknown';
    const severity = violation.severity || 'warning';

    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(lineNum, colNum, lineNum, colNum + 1),
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
    const pythonPath = config.get<string>('pythonPath') || 'python3';
    const tbLintPath = config.get<string>('tbLintPath') || getTbLintPath();
    const configFile = config.get<string>('configFile');

    outputChannel.appendLine(`\n--- Linting workspace: ${workspaceFolder.uri.fsPath} ---`);
    outputChannel.show(true);

    try {
        const args = [tbLintPath, workspaceFolder.uri.fsPath];
        if (configFile) {
            args.push('-c', configFile);
        }
        args.push('--json');

        const process = spawn(pythonPath, args);
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

export function deactivate() {
    outputChannel.dispose();
    diagnosticCollection.dispose();
}