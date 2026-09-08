
import * as vscode from 'vscode';
import { GroqSidebarProvider } from './SidebarProvider';
import { analyzeWorkspaceFiles } from './analyzer';
import { analyzeWithGroq, runModelAvailabilityDiagnostic } from '../../backend/groqClient';
import { SYSTEM_LEVEL_BUGS_PROMPT } from '../../backend/promptTemplates';

async function runAnalysis(sidebarProvider: GroqSidebarProvider) {
  vscode.window.showInformationMessage('Starting Groq Code Review Analysis...');

  try {
    // 🔹 Step 1: Get workspace files
    const fileContexts = await analyzeWorkspaceFiles();

    if (!fileContexts || fileContexts.length === 0) {
      vscode.window.showWarningMessage('No files found in workspace.');
      return;
    }

    // 🔹 Step 2: Prepare prompt
    const promptData = `
Analyze the following codebase and detect system-level bugs (arithmetic/logic
bugs and resource/runtime bugs) as instructed.

=== CODE CONTEXT ===
${fileContexts
  .map((f: any) => `File: ${f.fileName}\n\`\`\`\n${f.content}\n\`\`\``)
  .join('\n\n')}
`;

    // 🔹 Step 3: Call Groq API
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing via Groq...',
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: 'Sending request to Groq...' });

        return await analyzeWithGroq(
          SYSTEM_LEVEL_BUGS_PROMPT,
          promptData
        );
      }
    );

    console.log("Groq Result:", result);

    const issues = Array.isArray(result?.issues) ? result.issues : [];

    sidebarProvider.postMessage({
      type: 'analysis_result',
      issues
    });

    // 🔹 Step 4: Notification
    if (issues.length > 0) {
      vscode.window.showWarningMessage(
        `Found ${issues.length} potential issue(s). Check the Groq Sidebar.`
      );
    } else {
      vscode.window.showInformationMessage('No system-level bugs detected!');
    }

  } catch (error: any) {
    console.error("Analysis Error:", error);
    vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
  }
}

export function registerCommands(
  context: vscode.ExtensionContext,
  sidebarProvider: GroqSidebarProvider
) {
  const analyzeCommand = vscode.commands.registerCommand(
    'groq-reviewer.analyzeCode',
    async () => {
      await runAnalysis(sidebarProvider);
    }
  );

  const detectBugsCommand = vscode.commands.registerCommand(
    'groq-reviewer.detectBugs',
    async () => {
      await runAnalysis(sidebarProvider);
    }
  );

  const checkModelAccessCommand = vscode.commands.registerCommand(
    'groq-reviewer.checkModelAccess',
    async () => {
      await runModelAvailabilityDiagnostic();
    }
  );

  context.subscriptions.push(analyzeCommand, detectBugsCommand, checkModelAccessCommand);
}

