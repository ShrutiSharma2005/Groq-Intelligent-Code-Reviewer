"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const vscode = __importStar(require("vscode"));
const analyzer_1 = require("./analyzer");
const groqClient_1 = require("../../backend/groqClient");
const promptTemplates_1 = require("../../backend/promptTemplates");
async function runAnalysis(sidebarProvider) {
    vscode.window.showInformationMessage('Starting Groq Code Review Analysis...');
    try {
        // 🔹 Step 1: Get workspace files
        const fileContexts = await (0, analyzer_1.analyzeWorkspaceFiles)();
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
            .map((f) => `File: ${f.fileName}\n\`\`\`\n${f.content}\n\`\`\``)
            .join('\n\n')}
`;
        // 🔹 Step 3: Call Groq API
        const result = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing via Groq...',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Sending request to Groq...' });
            return await (0, groqClient_1.analyzeWithGroq)(promptTemplates_1.SYSTEM_LEVEL_BUGS_PROMPT, promptData);
        });
        console.log("Groq Result:", result);
        const issues = Array.isArray(result?.issues) ? result.issues : [];
        sidebarProvider.postMessage({
            type: 'analysis_result',
            issues
        });
        // 🔹 Step 4: Notification
        if (issues.length > 0) {
            vscode.window.showWarningMessage(`Found ${issues.length} potential issue(s). Check the Groq Sidebar.`);
        }
        else {
            vscode.window.showInformationMessage('No system-level bugs detected!');
        }
    }
    catch (error) {
        console.error("Analysis Error:", error);
        vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
    }
}
function registerCommands(context, sidebarProvider) {
    const analyzeCommand = vscode.commands.registerCommand('groq-reviewer.analyzeCode', async () => {
        await runAnalysis(sidebarProvider);
    });
    const detectBugsCommand = vscode.commands.registerCommand('groq-reviewer.detectBugs', async () => {
        await runAnalysis(sidebarProvider);
    });
    const checkModelAccessCommand = vscode.commands.registerCommand('groq-reviewer.checkModelAccess', async () => {
        await (0, groqClient_1.runModelAvailabilityDiagnostic)();
    });
    context.subscriptions.push(analyzeCommand, detectBugsCommand, checkModelAccessCommand);
}
//# sourceMappingURL=commands.js.map