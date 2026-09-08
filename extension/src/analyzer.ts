import * as vscode from 'vscode';
import * as path from 'path';

export interface FileContext {
  fileName: string;
  filePath: string;
  content: string;
}

/**
 * Gathers the file content for currently opened files (or entire workspace iteratively)
 * For Phase 1, we will grab the active file and all other visible or open documents 
 * in the workspace to give cross-file context safely.
 */
export async function analyzeWorkspaceFiles(): Promise<FileContext[]> {
  const contexts: FileContext[] = [];

  const textDocuments = vscode.workspace.textDocuments;

  for (const doc of textDocuments) {
    // Ignore internal VSCode files (e.g. settings, output channels)
    if (doc.uri.scheme !== 'file') {
      continue;
    }

    const { fileName, uri } = doc;
    const content = doc.getText();

    contexts.push({
      fileName: path.basename(fileName),
      filePath: uri.fsPath,
      content,
    });
  }

  // If no files are currently completely open but there's an active editor, ensure it's captured
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const fsPath = activeEditor.document.uri.fsPath;
    const exists = contexts.find(f => f.filePath === fsPath);
    if (!exists && activeEditor.document.uri.scheme === 'file') {
      contexts.push({
        fileName: path.basename(activeEditor.document.fileName),
        filePath: fsPath,
        content: activeEditor.document.getText(),
      });
    }
  }

  return contexts;
}
