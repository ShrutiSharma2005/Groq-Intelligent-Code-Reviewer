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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROQ_MODEL = void 0;
exports.initGroqClient = initGroqClient;
exports.getGroqClient = getGroqClient;
exports.checkModelAvailability = checkModelAvailability;
exports.runModelAvailabilityDiagnostic = runModelAvailabilityDiagnostic;
exports.analyzeWithGroq = analyzeWithGroq;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const vscode = __importStar(require("vscode"));
let groq = null;
/**
 * The ONLY model this extension is allowed to call.
 * Do not make this configurable and do not add fallbacks — if a request to
 * this model fails, the Groq error must be surfaced to the user as-is.
 */
exports.GROQ_MODEL = "openai/gpt-oss-120b";
/**
 * Initializes the Groq client with the API key from VS Code settings.
 */
const HARDCODED_API_KEY = ""; // Replace with your actual API key or leave as is to force users to set it in settings
function initGroqClient() {
    const config = vscode.workspace.getConfiguration("groq-reviewer");
    // Use the key from VS Code settings, or fall back to the hardcoded key
    const apiKey = config.get("apiKey") || HARDCODED_API_KEY;
    if (!apiKey) {
        vscode.window.showErrorMessage("Groq API Key is not set. Please configure 'groq-reviewer.apiKey' in your settings.");
        return;
    }
    groq = new groq_sdk_1.default({ apiKey });
}
async function getGroqClient() {
    if (!groq) {
        initGroqClient();
    }
    if (!groq) {
        throw new Error("Unable to initialize Groq Client. Check API Key.");
    }
    return groq;
}
/**
 * Diagnostic ONLY — checks whether the configured Groq API key can see
 * openai/gpt-oss-120b in its available model list.
 *
 * This NEVER logs or returns the API key itself, only model IDs.
 * It does not call chat completions and does not touch GROQ_MODEL.
 */
async function checkModelAvailability() {
    try {
        const client = await getGroqClient();
        const response = await client.models.list();
        // response.data is the array of { id, ... } model objects.
        const modelIds = (response?.data ?? [])
            .map((m) => m?.id)
            .filter((id) => typeof id === "string")
            .sort();
        return {
            ok: true,
            modelIds,
            targetAvailable: modelIds.includes(exports.GROQ_MODEL),
        };
    }
    catch (error) {
        return {
            ok: false,
            modelIds: [],
            targetAvailable: false,
            error: error?.message || String(error),
        };
    }
}
/**
 * Runs checkModelAvailability() and reports the result via a dedicated
 * VS Code output channel. Prints model IDs only — never the API key.
 */
async function runModelAvailabilityDiagnostic() {
    const output = vscode.window.createOutputChannel("Groq Reviewer Diagnostics");
    output.show(true);
    output.appendLine(`Checking model access for: ${exports.GROQ_MODEL}`);
    output.appendLine("(API key is never printed.)");
    output.appendLine("");
    const result = await checkModelAvailability();
    if (!result.ok) {
        output.appendLine(`FAILED to reach Groq's model list endpoint.`);
        output.appendLine(`Error: ${result.error}`);
        vscode.window.showErrorMessage("Could not verify Groq model access — see 'Groq Reviewer Diagnostics' output.");
        return;
    }
    output.appendLine(`Models visible to this API key (${result.modelIds.length}):`);
    for (const id of result.modelIds) {
        output.appendLine(`  - ${id}`);
    }
    output.appendLine("");
    if (result.targetAvailable) {
        output.appendLine(`✅ ${exports.GROQ_MODEL} IS in this key's model list.`);
        output.appendLine("If chat completions still 404 for this model, the problem is in the request itself, not access.");
        vscode.window.showInformationMessage(`${exports.GROQ_MODEL} is available to your Groq API key.`);
    }
    else {
        output.appendLine(`❌ ${exports.GROQ_MODEL} is NOT in this key's model list.`);
        output.appendLine("This means your Groq account/key does not currently have access to this model " +
            "(it may be deprecated or restricted on your plan). No fallback model was used.");
        vscode.window.showWarningMessage(`${exports.GROQ_MODEL} is not available to your Groq API key. See 'Groq Reviewer Diagnostics' output.`);
    }
}
/**
 * Sends a prompt to the Groq API and expects a JSON response.
 */
async function analyzeWithGroq(systemPrompt, userContent) {
    const client = await getGroqClient();
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
            model: exports.GROQ_MODEL,
            temperature: 0.1,
            response_format: { type: "json_object" },
        });
        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content received from Groq API.");
        }
        return JSON.parse(content);
    }
    catch (error) {
        // Do NOT fall back to another model or provider. Surface the exact
        // Groq error to the user so they can see what actually failed.
        const message = error?.message || String(error);
        vscode.window.showErrorMessage(`Groq API Error (model: ${exports.GROQ_MODEL}): ${message}`);
        throw error;
    }
}
//# sourceMappingURL=groqClient.js.map