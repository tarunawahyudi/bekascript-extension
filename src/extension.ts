import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    console.log('BekaScript extension is now active!');

    // Register command to run BekaScript files
    let disposable = vscode.commands.registerCommand('bekascript.run', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const document = editor.document;

        if (document.languageId !== 'bekascript') {
            vscode.window.showErrorMessage('This is not a BekaScript file!');
            return;
        }

        // Save file before running
        document.save().then(() => {
            const filePath = document.fileName;
            const interpreterPath = path.join(context.extensionPath, 'bekascript.js');

            // Create output channel
            const outputChannel = vscode.window.createOutputChannel('BekaScript');
            outputChannel.clear();
            outputChannel.show();

            outputChannel.appendLine('Running BekaScript...');
            outputChannel.appendLine('File: ' + filePath);
            outputChannel.appendLine('---');

            // Execute BekaScript interpreter
            exec(`node "${interpreterPath}" "${filePath}"`, (error, stdout, stderr) => {
                if (error) {
                    outputChannel.appendLine('Error: ' + error.message);
                    vscode.window.showErrorMessage('BekaScript execution failed!');
                    return;
                }

                if (stderr) {
                    outputChannel.appendLine('Error: ' + stderr);
                }

                if (stdout) {
                    outputChannel.appendLine(stdout);
                }

                outputChannel.appendLine('---');
                outputChannel.appendLine('BekaScript execution completed.');
            });
        });
    });

    // Register hover provider for BekaScript keywords
    const hoverProvider = vscode.languages.registerHoverProvider('bekascript', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

            const keywordHelp: { [key: string]: string } = {
                'punya': 'Deklarasi konstanta (sama seperti `const` dalam JavaScript)\n\nContoh: `punya nama = "Beka";`',
                'anu': 'Deklarasi variabel (sama seperti `let` dalam JavaScript)\n\nContoh: `anu umur = 25;`',
                'nongol': 'Menampilkan output (sama seperti `console.log` dalam JavaScript)\n\nContoh: `nongol "Halo dunia!";`',
                'kalo': 'Kondisi if untuk percabangan\n\nContoh: `kalo (umur > 18) { nongol "Dewasa"; }`',
                'yakali': 'Kondisi else if untuk percabangan\n\nContoh: `yakali (umur > 12) { nongol "Remaja"; }`',
                'kalo_kaga': 'Kondisi else untuk percabangan\n\nContoh: `kalo_kaga { nongol "Anak-anak"; }`',
                'ulangin': 'Loop for dengan syntax yang lebih sederhana\n\nContoh: `ulangin i dari 0 ampe 5 { nongol i; }`',
                'dari': 'Kata kunci untuk menentukan nilai awal loop',
                'ampe': 'Kata kunci untuk menentukan batas akhir loop',
                'pokonya': 'Loop while untuk perulangan berdasarkan kondisi\n\nContoh: `pokonya (i < 10) { i++; }`',
                'guna': 'Deklarasi fungsi (sama seperti `function` dalam JavaScript)\n\nContoh: `guna sapa(nama) { nongol "Halo " + nama; }`',
                'balik': 'Return statement untuk mengembalikan nilai dari fungsi\n\nContoh: `balik hasil;`'
            };

            if (keywordHelp[word]) {
                return new vscode.Hover(new vscode.MarkdownString(keywordHelp[word]));
            }

            return null;
        }
    });

    const completionProvider = vscode.languages.registerCompletionItemProvider('bekascript', {
        provideCompletionItems(document, position, token, context) {
            const completions: vscode.CompletionItem[] = [
                {
                    label: 'punya',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'Deklarasi konstanta',
                    documentation: 'Membuat konstanta (sama seperti const)',
                    insertText: new vscode.SnippetString('punya ${1:nama} = ${2:nilai};')
                },
                {
                    label: 'anu',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'Deklarasi variabel',
                    documentation: 'Membuat variabel (sama seperti let)',
                    insertText: new vscode.SnippetString('anu ${1:nama} = ${2:nilai};')
                },
                {
                    label: 'nongol',
                    kind: vscode.CompletionItemKind.Function,
                    detail: 'Output statement',
                    documentation: 'Menampilkan output ke konsol',
                    insertText: new vscode.SnippetString('nongol ${1:"pesan"};')
                },
                {
                    label: 'kalo',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'If statement',
                    documentation: 'Kondisi percabangan',
                    insertText: new vscode.SnippetString('kalo (${1:kondisi}) {\n\t${2:// kode}\n}')
                },
                {
                    label: 'yakali',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'Else if statement',
                    documentation: 'Kondisi else if',
                    insertText: new vscode.SnippetString('yakali (${1:kondisi}) {\n\t${2:// kode}\n}')
                },
                {
                    label: 'kalo_kaga',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'Else statement',
                    documentation: 'Kondisi else',
                    insertText: new vscode.SnippetString('kalo_kaga {\n\t${1:// kode}\n}')
                },
                {
                    label: 'ulangin',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'For loop',
                    documentation: 'Loop for dengan syntax sederhana',
                    insertText: new vscode.SnippetString('ulangin ${1:i} dari ${2:0} ampe ${3:10} {\n\t${4:// kode}\n}')
                },
                {
                    label: 'pokonya',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'While loop',
                    documentation: 'Loop berdasarkan kondisi',
                    insertText: new vscode.SnippetString('pokonya (${1:kondisi}) {\n\t${2:// kode}\n}')
                },
                {
                    label: 'guna',
                    kind: vscode.CompletionItemKind.Function,
                    detail: 'Function declaration',
                    documentation: 'Deklarasi fungsi',
                    insertText: new vscode.SnippetString('guna ${1:namaFungsi}(${2:parameter}) {\n\t${3:// kode}\n}')
                },
                {
                    label: 'balik',
                    kind: vscode.CompletionItemKind.Keyword,
                    detail: 'Return statement',
                    documentation: 'Mengembalikan nilai dari fungsi',
                    insertText: new vscode.SnippetString('balik ${1:nilai};')
                }
            ];

            return completions;
        }
    });

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('bekascript');

    const updateDiagnostics = (document: vscode.TextDocument) => {
        if (document.languageId !== 'bekascript') {
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        lines.forEach((line, lineIndex) => {
            if (line.trim() &&
                !line.trim().endsWith(';') &&
                !line.trim().endsWith('{') &&
                !line.trim().endsWith('}') &&
                !line.trim().startsWith('//') &&
                !line.includes('kalo ') &&
                !line.includes('yakali ') &&
                !line.includes('kalo_kaga') &&
                !line.includes('ulangin ') &&
                !line.includes('pokonya ') &&
                !line.includes('guna ')) {

                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(lineIndex, line.length - 1, lineIndex, line.length),
                    'Missing semicolon (;)',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }
        });

        const checkBracesAndParentheses = (fullText: string) => {
            let braceStack: { char: string, line: number, column: number }[] = [];
            let parenStack: { char: string, line: number, column: number }[] = [];

            const lines = fullText.split('\n');

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                for (let columnIndex = 0; columnIndex < line.length; columnIndex++) {
                    const char = line[columnIndex];

                    if (char === '{') {
                        braceStack.push({ char, line: lineIndex, column: columnIndex });
                    } else if (char === '}') {
                        if (braceStack.length > 0) {
                            braceStack.pop();
                        } else {
                            diagnostics.push(new vscode.Diagnostic(
                                new vscode.Range(lineIndex, columnIndex, lineIndex, columnIndex + 1),
                                'Unmatched closing brace }',
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    } else if (char === '(') {
                        parenStack.push({ char, line: lineIndex, column: columnIndex });
                    } else if (char === ')') {
                        if (parenStack.length > 0) {
                            parenStack.pop();
                        } else {
                            diagnostics.push(new vscode.Diagnostic(
                                new vscode.Range(lineIndex, columnIndex, lineIndex, columnIndex + 1),
                                'Unmatched closing parenthesis )',
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    }
                }
            }

            while (braceStack.length > 0) {
                const unmatched = braceStack.pop();
                if (unmatched) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(unmatched.line, unmatched.column, unmatched.line, unmatched.column + 1),
                        'Unmatched opening brace {',
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }

            while (parenStack.length > 0) {
                const unmatched = parenStack.pop();
                if (unmatched) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(unmatched.line, unmatched.column, unmatched.line, unmatched.column + 1),
                        'Unmatched opening parenthesis (',
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        };

        checkBracesAndParentheses(text);

        diagnosticCollection.set(document.uri, diagnostics);
    };

    // Listen to document changes
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        updateDiagnostics(event.document);
    });

    const documentOpenListener = vscode.workspace.onDidOpenTextDocument(document => {
        updateDiagnostics(document);
    });

    // Update diagnostics for already open documents
    vscode.workspace.textDocuments.forEach(updateDiagnostics);

    context.subscriptions.push(
        disposable,
        hoverProvider,
        completionProvider,
        diagnosticCollection,
        documentChangeListener,
        documentOpenListener
    );
}

export function deactivate() {
    console.log('BekaScript extension deactivated');
}
