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
exports.analyzeWorkspaceFiles = analyzeWorkspaceFiles;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Gathers the file content for currently opened files (or entire workspace iteratively)
 * For Phase 1, we will grab the active file and all other visible or open documents
 * in the workspace to give cross-file context safely.
 */
async function analyzeWorkspaceFiles() {
    const contexts = [];
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
//# sourceMappingURL=analyzer.js.map