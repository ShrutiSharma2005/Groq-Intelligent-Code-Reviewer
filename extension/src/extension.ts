import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { GroqSidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Groq Intelligent Code Reviewer is now active!');

  const sidebarProvider = new GroqSidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "groq-reviewer.sidebar",
      sidebarProvider
    )
  );

  registerCommands(context, sidebarProvider);
}

export function deactivate() {
  // no-op required for VS Code extension lifecycle cleanup support
  return;
}
