/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerCommands: () => (/* binding */ registerCommands)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _analyzer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _backend_groqClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _backend_promptTemplates__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(45);




async function runAnalysis(sidebarProvider) {
    vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('Starting Groq Code Review Analysis...');
    try {
        // 🔹 Step 1: Get workspace files
        const fileContexts = await (0,_analyzer__WEBPACK_IMPORTED_MODULE_1__.analyzeWorkspaceFiles)();
        if (!fileContexts || fileContexts.length === 0) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage('No files found in workspace.');
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
        const result = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({
            location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Notification,
            title: 'Analyzing via Groq...',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Sending request to Groq...' });
            return await (0,_backend_groqClient__WEBPACK_IMPORTED_MODULE_2__.analyzeWithGroq)(_backend_promptTemplates__WEBPACK_IMPORTED_MODULE_3__.SYSTEM_LEVEL_BUGS_PROMPT, promptData);
        });
        console.log("Groq Result:", result);
        const issues = Array.isArray(result?.issues) ? result.issues : [];
        sidebarProvider.postMessage({
            type: 'analysis_result',
            issues
        });
        // 🔹 Step 4: Notification
        if (issues.length > 0) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage(`Found ${issues.length} potential issue(s). Check the Groq Sidebar.`);
        }
        else {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage('No system-level bugs detected!');
        }
    }
    catch (error) {
        console.error("Analysis Error:", error);
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`Analysis failed: ${error.message}`);
    }
}
function registerCommands(context, sidebarProvider) {
    const analyzeCommand = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('groq-reviewer.analyzeCode', async () => {
        await runAnalysis(sidebarProvider);
    });
    const detectBugsCommand = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('groq-reviewer.detectBugs', async () => {
        await runAnalysis(sidebarProvider);
    });
    const checkModelAccessCommand = vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand('groq-reviewer.checkModelAccess', async () => {
        await (0,_backend_groqClient__WEBPACK_IMPORTED_MODULE_2__.runModelAvailabilityDiagnostic)();
    });
    context.subscriptions.push(analyzeCommand, detectBugsCommand, checkModelAccessCommand);
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   analyzeWorkspaceFiles: () => (/* binding */ analyzeWorkspaceFiles)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Gathers the file content for currently opened files (or entire workspace iteratively)
 * For Phase 1, we will grab the active file and all other visible or open documents
 * in the workspace to give cross-file context safely.
 */
async function analyzeWorkspaceFiles() {
    const contexts = [];
    const textDocuments = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.textDocuments;
    for (const doc of textDocuments) {
        // Ignore internal VSCode files (e.g. settings, output channels)
        if (doc.uri.scheme !== 'file') {
            continue;
        }
        const { fileName, uri } = doc;
        const content = doc.getText();
        contexts.push({
            fileName: path__WEBPACK_IMPORTED_MODULE_1__.basename(fileName),
            filePath: uri.fsPath,
            content,
        });
    }
    // If no files are currently completely open but there's an active editor, ensure it's captured
    const activeEditor = vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeTextEditor;
    if (activeEditor) {
        const fsPath = activeEditor.document.uri.fsPath;
        const exists = contexts.find(f => f.filePath === fsPath);
        if (!exists && activeEditor.document.uri.scheme === 'file') {
            contexts.push({
                fileName: path__WEBPACK_IMPORTED_MODULE_1__.basename(activeEditor.document.fileName),
                filePath: fsPath,
                content: activeEditor.document.getText(),
            });
        }
    }
    return contexts;
}


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GROQ_MODEL: () => (/* binding */ GROQ_MODEL),
/* harmony export */   analyzeWithGroq: () => (/* binding */ analyzeWithGroq),
/* harmony export */   checkModelAvailability: () => (/* binding */ checkModelAvailability),
/* harmony export */   computeRiskScore: () => (/* binding */ computeRiskScore),
/* harmony export */   getGroqClient: () => (/* binding */ getGroqClient),
/* harmony export */   getRiskLevelForScore: () => (/* binding */ getRiskLevelForScore),
/* harmony export */   initGroqClient: () => (/* binding */ initGroqClient),
/* harmony export */   runModelAvailabilityDiagnostic: () => (/* binding */ runModelAvailabilityDiagnostic),
/* harmony export */   sanitizeReviewIssue: () => (/* binding */ sanitizeReviewIssue),
/* harmony export */   sanitizeReviewResults: () => (/* binding */ sanitizeReviewResults)
/* harmony export */ });
/* harmony import */ var groq_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_1__);


let groq = null;
/**
 * The ONLY model this extension is allowed to call.
 * Do not make this configurable and do not add fallbacks — if a request to
 * this model fails, the Groq error must be surfaced to the user as-is.
 */
const GROQ_MODEL = "openai/gpt-oss-120b";
/**
 * Initializes the Groq client with the API key from VS Code settings.
 */
const HARDCODED_API_KEY = ""; // Replace with your actual API key or leave as is to force users to set it in settings
function clampScore(value, min = 1, max = 100) {
    return Math.min(Math.max(Math.round(value), min), max);
}
function getRiskLevelForScore(score) {
    if (score <= 20)
        return "Low";
    if (score <= 40)
        return "Medium";
    if (score <= 60)
        return "Moderate";
    if (score <= 80)
        return "High";
    return "Critical";
}
function computeRiskScore(impact, likelihood, propagation, exploitability) {
    const weighted = impact * 0.4 +
        likelihood * 0.3 +
        propagation * 0.2 +
        exploitability * 0.1;
    return clampScore(weighted);
}
function sanitizeReviewIssue(rawIssue) {
    if (!rawIssue || typeof rawIssue !== "object") {
        return null;
    }
    const impactScore = clampScore(Number(rawIssue.impactScore ?? 1));
    const likelihoodScore = clampScore(Number(rawIssue.likelihoodScore ?? 1));
    const propagationScore = clampScore(Number(rawIssue.propagationScore ?? 1));
    const exploitabilityScore = clampScore(Number(rawIssue.exploitabilityScore ?? 1));
    const riskScore = clampScore(computeRiskScore(impactScore, likelihoodScore, propagationScore, exploitabilityScore));
    const riskLevel = getRiskLevelForScore(riskScore);
    const confidence = rawIssue.confidence === "High" || rawIssue.confidence === "Medium" || rawIssue.confidence === "Low"
        ? rawIssue.confidence
        : "Medium";
    const severity = rawIssue.severity === "Critical" ||
        rawIssue.severity === "High" ||
        rawIssue.severity === "Medium" ||
        rawIssue.severity === "Low"
        ? rawIssue.severity
        : riskLevel === "Critical"
            ? "Critical"
            : riskLevel === "High"
                ? "High"
                : riskLevel === "Moderate"
                    ? "Medium"
                    : riskLevel === "Medium"
                        ? "Medium"
                        : "Low";
    return {
        type: String(rawIssue.type ?? "Issue"),
        severity,
        file: String(rawIssue.file ?? "unknown"),
        line: Number.isFinite(Number(rawIssue.line)) ? Number(rawIssue.line) : 1,
        title: String(rawIssue.title ?? "Potential system-level bug"),
        explanation: String(rawIssue.explanation ?? "No explanation provided."),
        impact: String(rawIssue.impact ?? "No impact description provided."),
        fix: String(rawIssue.fix ?? "Review and patch the code path."),
        code_fix: String(rawIssue.code_fix ?? ""),
        confidence,
        riskScore,
        riskLevel,
        impactScore,
        likelihoodScore,
        propagationScore,
        exploitabilityScore,
        riskReason: String(rawIssue.riskReason ??
            "Risk is based on the code's reachable impact, likelihood, propagation, and exploitability in context."),
    };
}
function sanitizeReviewResults(result) {
    const issues = Array.isArray(result?.issues) ? result.issues : [];
    return issues
        .map((issue) => sanitizeReviewIssue(issue))
        .filter((issue) => issue !== null);
}
function initGroqClient() {
    const config = vscode__WEBPACK_IMPORTED_MODULE_1__.workspace.getConfiguration("groq-reviewer");
    // Use the key from VS Code settings, or fall back to the hardcoded key
    const apiKey = config.get("apiKey") || HARDCODED_API_KEY;
    if (!apiKey) {
        vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage("Groq API Key is not set. Please configure 'groq-reviewer.apiKey' in your settings.");
        return;
    }
    groq = new groq_sdk__WEBPACK_IMPORTED_MODULE_0__["default"]({ apiKey });
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
            targetAvailable: modelIds.includes(GROQ_MODEL),
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
    const output = vscode__WEBPACK_IMPORTED_MODULE_1__.window.createOutputChannel("Groq Reviewer Diagnostics");
    output.show(true);
    output.appendLine(`Checking model access for: ${GROQ_MODEL}`);
    output.appendLine("(API key is never printed.)");
    output.appendLine("");
    const result = await checkModelAvailability();
    if (!result.ok) {
        output.appendLine(`FAILED to reach Groq's model list endpoint.`);
        output.appendLine(`Error: ${result.error}`);
        vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage("Could not verify Groq model access — see 'Groq Reviewer Diagnostics' output.");
        return;
    }
    output.appendLine(`Models visible to this API key (${result.modelIds.length}):`);
    for (const id of result.modelIds) {
        output.appendLine(`  - ${id}`);
    }
    output.appendLine("");
    if (result.targetAvailable) {
        output.appendLine(`✅ ${GROQ_MODEL} IS in this key's model list.`);
        output.appendLine("If chat completions still 404 for this model, the problem is in the request itself, not access.");
        vscode__WEBPACK_IMPORTED_MODULE_1__.window.showInformationMessage(`${GROQ_MODEL} is available to your Groq API key.`);
    }
    else {
        output.appendLine(`❌ ${GROQ_MODEL} is NOT in this key's model list.`);
        output.appendLine("This means your Groq account/key does not currently have access to this model " +
            "(it may be deprecated or restricted on your plan). No fallback model was used.");
        vscode__WEBPACK_IMPORTED_MODULE_1__.window.showWarningMessage(`${GROQ_MODEL} is not available to your Groq API key. See 'Groq Reviewer Diagnostics' output.`);
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
            model: GROQ_MODEL,
            temperature: 0.1,
            response_format: { type: "json_object" },
        });
        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content received from Groq API.");
        }
        const parsed = JSON.parse(content);
        return {
            ...parsed,
            issues: sanitizeReviewResults(parsed),
        };
    }
    catch (error) {
        // Do NOT fall back to another model or provider. Surface the exact
        // Groq error to the user so they can see what actually failed.
        const message = error?.message || String(error);
        vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage(`Groq API Error (model: ${GROQ_MODEL}): ${message}`);
        throw error;
    }
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APIConnectionError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.APIConnectionError),
/* harmony export */   APIConnectionTimeoutError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.APIConnectionTimeoutError),
/* harmony export */   APIError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.APIError),
/* harmony export */   APIPromise: () => (/* reexport safe */ _core_api_promise_mjs__WEBPACK_IMPORTED_MODULE_2__.APIPromise),
/* harmony export */   APIUserAbortError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.APIUserAbortError),
/* harmony export */   AuthenticationError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.AuthenticationError),
/* harmony export */   BadRequestError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.BadRequestError),
/* harmony export */   ConflictError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.ConflictError),
/* harmony export */   Groq: () => (/* reexport safe */ _client_mjs__WEBPACK_IMPORTED_MODULE_0__.Groq),
/* harmony export */   GroqError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.GroqError),
/* harmony export */   InternalServerError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.InternalServerError),
/* harmony export */   NotFoundError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.NotFoundError),
/* harmony export */   PermissionDeniedError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.PermissionDeniedError),
/* harmony export */   RateLimitError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.RateLimitError),
/* harmony export */   UnprocessableEntityError: () => (/* reexport safe */ _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__.UnprocessableEntityError),
/* harmony export */   "default": () => (/* reexport safe */ _client_mjs__WEBPACK_IMPORTED_MODULE_0__.Groq),
/* harmony export */   toFile: () => (/* reexport safe */ _core_uploads_mjs__WEBPACK_IMPORTED_MODULE_1__.toFile)
/* harmony export */ });
/* harmony import */ var _client_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony import */ var _core_uploads_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);
/* harmony import */ var _core_api_promise_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(38);
/* harmony import */ var _core_error_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.





//# sourceMappingURL=index.mjs.map

/***/ }),
/* 7 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Groq: () => (/* binding */ Groq)
/* harmony export */ });
/* harmony import */ var _internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _internal_utils_uuid_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _internal_utils_values_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _internal_utils_sleep_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);
/* harmony import */ var _internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(12);
/* harmony import */ var _internal_detect_platform_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(14);
/* harmony import */ var _internal_shims_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(16);
/* harmony import */ var _internal_request_options_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(17);
/* harmony import */ var _internal_utils_query_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(18);
/* harmony import */ var _version_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(15);
/* harmony import */ var _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(11);
/* harmony import */ var _core_uploads_mjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(19);
/* harmony import */ var _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(22);
/* harmony import */ var _core_api_promise_mjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(38);
/* harmony import */ var _resources_batches_mjs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(30);
/* harmony import */ var _resources_completions_mjs__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(34);
/* harmony import */ var _resources_embeddings_mjs__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(35);
/* harmony import */ var _resources_files_mjs__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(36);
/* harmony import */ var _resources_models_mjs__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(37);
/* harmony import */ var _resources_audio_audio_mjs__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(24);
/* harmony import */ var _resources_chat_chat_mjs__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(32);
/* harmony import */ var _internal_headers_mjs__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(27);
/* harmony import */ var _internal_utils_env_mjs__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(44);
/* harmony import */ var _internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(43);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _Groq_instances, _a, _Groq_encoder, _Groq_baseURLOverridden;


























/**
 * API Client for interfacing with the Groq API.
 */
class Groq {
    /**
     * API Client for interfacing with the Groq API.
     *
     * @param {string | undefined} [opts.apiKey=process.env['GROQ_API_KEY'] ?? undefined]
     * @param {string} [opts.baseURL=process.env['GROQ_BASE_URL'] ?? https://api.groq.com] - Override the default base URL for the API.
     * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ baseURL = (0,_internal_utils_env_mjs__WEBPACK_IMPORTED_MODULE_22__.readEnv)('GROQ_BASE_URL'), apiKey = (0,_internal_utils_env_mjs__WEBPACK_IMPORTED_MODULE_22__.readEnv)('GROQ_API_KEY'), ...opts } = {}) {
        _Groq_instances.add(this);
        _Groq_encoder.set(this, void 0);
        this.completions = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Completions(this);
        this.chat = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Chat(this);
        this.embeddings = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Embeddings(this);
        this.audio = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Audio(this);
        this.models = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Models(this);
        this.batches = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Batches(this);
        this.files = new _resources_index_mjs__WEBPACK_IMPORTED_MODULE_12__.Files(this);
        if (apiKey === undefined) {
            throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.GroqError("The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: 'My API Key' }).");
        }
        const options = {
            apiKey,
            ...opts,
            baseURL: baseURL || `https://api.groq.com`,
        };
        if (!options.dangerouslyAllowBrowser && (0,_internal_detect_platform_mjs__WEBPACK_IMPORTED_MODULE_5__.isRunningInBrowser)()) {
            throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.GroqError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Groq({ apiKey, dangerouslyAllowBrowser: true })");
        }
        this.baseURL = options.baseURL;
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT /* 1 minute */;
        this.logger = options.logger ?? console;
        const defaultLogLevel = 'warn';
        // Set default logLevel early so that we can log a warning in parseLogLevel.
        this.logLevel = defaultLogLevel;
        this.logLevel =
            (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.parseLogLevel)(options.logLevel, 'ClientOptions.logLevel', this) ??
                (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.parseLogLevel)((0,_internal_utils_env_mjs__WEBPACK_IMPORTED_MODULE_22__.readEnv)('GROQ_LOG'), "process.env['GROQ_LOG']", this) ??
                defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? _internal_shims_mjs__WEBPACK_IMPORTED_MODULE_6__.getDefaultFetch();
        (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _Groq_encoder, _internal_request_options_mjs__WEBPACK_IMPORTED_MODULE_7__.FallbackEncoder, "f");
        const customHeadersEnv = (0,_internal_utils_env_mjs__WEBPACK_IMPORTED_MODULE_22__.readEnv)('GROQ_CUSTOM_HEADERS');
        if (customHeadersEnv) {
            const parsed = {};
            for (const line of customHeadersEnv.split('\n')) {
                const colon = line.indexOf(':');
                if (colon >= 0) {
                    parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
                }
            }
            options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
        }
        this._options = options;
        this.apiKey = apiKey;
    }
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */
    withOptions(options) {
        const client = new this.constructor({
            ...this._options,
            baseURL: this.baseURL,
            maxRetries: this.maxRetries,
            timeout: this.timeout,
            logger: this.logger,
            logLevel: this.logLevel,
            fetch: this.fetch,
            fetchOptions: this.fetchOptions,
            apiKey: this.apiKey,
            ...options,
        });
        return client;
    }
    defaultQuery() {
        return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
        return;
    }
    async authHeaders(opts) {
        return (0,_internal_headers_mjs__WEBPACK_IMPORTED_MODULE_21__.buildHeaders)([{ Authorization: `Bearer ${this.apiKey}` }]);
    }
    /**
     * Basic re-implementation of `qs.stringify` for primitive types.
     */
    stringifyQuery(query) {
        return (0,_internal_utils_query_mjs__WEBPACK_IMPORTED_MODULE_8__.stringifyQuery)(query);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${_version_mjs__WEBPACK_IMPORTED_MODULE_9__.VERSION}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${(0,_internal_utils_uuid_mjs__WEBPACK_IMPORTED_MODULE_1__.uuid4)()}`;
    }
    makeStatusError(status, error, message, headers) {
        return _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = (!(0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _Groq_instances, "m", _Groq_baseURLOverridden).call(this) && defaultBaseURL) || this.baseURL;
        const url = (0,_internal_utils_values_mjs__WEBPACK_IMPORTED_MODULE_2__.isAbsoluteURL)(path) ?
            new URL(path)
            : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        const pathQuery = Object.fromEntries(url.searchParams);
        if (!(0,_internal_utils_values_mjs__WEBPACK_IMPORTED_MODULE_2__.isEmptyObj)(defaultQuery) || !(0,_internal_utils_values_mjs__WEBPACK_IMPORTED_MODULE_2__.isEmptyObj)(pathQuery)) {
            query = { ...pathQuery, ...defaultQuery, ...query };
        }
        if (typeof query === 'object' && query && !Array.isArray(query)) {
            url.search = this.stringifyQuery(query);
        }
        return url.toString();
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) { }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    async prepareRequest(request, { url, options }) { }
    get(path, opts) {
        return this.methodRequest('get', path, opts);
    }
    post(path, opts) {
        return this.methodRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.methodRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.methodRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.methodRequest('delete', path, opts);
    }
    methodRequest(method, path, opts) {
        return this.request(Promise.resolve(opts).then((opts) => {
            return { method, path, ...opts };
        }));
    }
    request(options, remainingRetries = null) {
        return new _core_api_promise_mjs__WEBPACK_IMPORTED_MODULE_13__.APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
            retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
            retryCount: maxRetries - retriesRemaining,
        });
        await this.prepareRequest(req, { url, options });
        /** Not an API request ID, just for correlating local log entries. */
        const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
        const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).debug(`[${requestLogID}] sending request`, (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.formatRequestDetails)({
            retryOfRequestLogID,
            method: options.method,
            url,
            options,
            headers: req.headers,
        }));
        if (options.signal?.aborted) {
            throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(_internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__.castToError);
        const headersTime = Date.now();
        if (response instanceof globalThis.Error) {
            const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
            if (options.signal?.aborted) {
                throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIUserAbortError();
            }
            // detect native connection timeout errors
            // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
            // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
            // others do not provide enough information to distinguish timeouts from other connection errors
            const isTimeout = (0,_internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__.isAbortError)(response) ||
                /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.formatRequestDetails)({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.formatRequestDetails)({
                retryOfRequestLogID,
                url,
                durationMs: headersTime - startTime,
                message: response.message,
            }));
            if (isTimeout) {
                throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIConnectionTimeoutError();
            }
            throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIConnectionError({ cause: response });
        }
        const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${response.ok ? 'succeeded' : 'failed'} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
            const shouldRetry = await this.shouldRetry(response);
            if (retriesRemaining && shouldRetry) {
                const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
                // We don't need the body of this response.
                await _internal_shims_mjs__WEBPACK_IMPORTED_MODULE_6__.CancelReadableStream(response.body);
                (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).info(`${responseInfo} - ${retryMessage}`);
                (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).debug(`[${requestLogID}] response error (${retryMessage})`, (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.formatRequestDetails)({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err) => (0,_internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__.castToError)(err).message);
            const errJSON = (0,_internal_utils_values_mjs__WEBPACK_IMPORTED_MODULE_2__.safeJSON)(errText);
            const errMessage = errJSON ? undefined : errText;
            (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).debug(`[${requestLogID}] response error (${retryMessage})`, (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.formatRequestDetails)({
                retryOfRequestLogID,
                url: response.url,
                status: response.status,
                headers: response.headers,
                message: errMessage,
                durationMs: Date.now() - startTime,
            }));
            const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
            throw err;
        }
        (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).info(responseInfo);
        (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.loggerFor)(this).debug(`[${requestLogID}] response start`, (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_23__.formatRequestDetails)({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
    }
    async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        const abort = this._makeAbort(controller);
        if (signal)
            signal.addEventListener('abort', abort, { once: true });
        const timeout = setTimeout(abort, ms);
        const isReadableBody = (globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream) ||
            (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);
        const fetchOptions = {
            signal: controller.signal,
            ...(isReadableBody ? { duplex: 'half' } : {}),
            method: 'GET',
            ...options,
        };
        if (method) {
            // Custom methods like 'patch' need to be uppercased
            // See https://github.com/nodejs/undici/issues/2294
            fetchOptions.method = method.toUpperCase();
        }
        try {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return await this.fetch.call(undefined, url, fetchOptions);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async shouldRetry(response) {
        // Note this is not a standard header.
        const shouldRetryHeader = response.headers.get('x-should-retry');
        // If the server explicitly says whether or not to retry, obey.
        if (shouldRetryHeader === 'true')
            return true;
        if (shouldRetryHeader === 'false')
            return false;
        // Retry on request timeouts.
        if (response.status === 408)
            return true;
        // Retry on lock timeouts.
        if (response.status === 409)
            return true;
        // Retry on rate limits.
        if (response.status === 429)
            return true;
        // Retry internal errors.
        if (response.status >= 500)
            return true;
        return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
        const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
        if (retryAfterMillisHeader) {
            const timeoutMs = parseFloat(retryAfterMillisHeader);
            if (!Number.isNaN(timeoutMs)) {
                timeoutMillis = timeoutMs;
            }
        }
        // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
        const retryAfterHeader = responseHeaders?.get('retry-after');
        if (retryAfterHeader && !timeoutMillis) {
            const timeoutSeconds = parseFloat(retryAfterHeader);
            if (!Number.isNaN(timeoutSeconds)) {
                timeoutMillis = timeoutSeconds * 1000;
            }
            else {
                timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
            }
        }
        // If the API asks us to wait a certain amount of time, just do what it
        // says, but otherwise calculate a default
        if (timeoutMillis === undefined) {
            const maxRetries = options.maxRetries ?? this.maxRetries;
            timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await (0,_internal_utils_sleep_mjs__WEBPACK_IMPORTED_MODULE_3__.sleep)(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8.0;
        const numRetries = maxRetries - retriesRemaining;
        // Apply exponential backoff, but not more than the max.
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        // Apply some jitter, take up to at most 25 percent of the retry time.
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1000;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path, query, defaultBaseURL } = options;
        const url = this.buildURL(path, query, defaultBaseURL);
        if ('timeout' in options)
            (0,_internal_utils_values_mjs__WEBPACK_IMPORTED_MODULE_2__.validatePositiveInteger)('timeout', options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
            method,
            headers: reqHeaders,
            ...(options.signal && { signal: options.signal }),
            ...(globalThis.ReadableStream &&
                body instanceof globalThis.ReadableStream && { duplex: 'half' }),
            ...(body && { body }),
            ...(this.fetchOptions ?? {}),
            ...(options.fetchOptions ?? {}),
        };
        return { req, url, timeout: options.timeout };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount, }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== 'get') {
            if (!options.idempotencyKey)
                options.idempotencyKey = this.defaultIdempotencyKey();
            idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = (0,_internal_headers_mjs__WEBPACK_IMPORTED_MODULE_21__.buildHeaders)([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
                ...(0,_internal_detect_platform_mjs__WEBPACK_IMPORTED_MODULE_5__.getPlatformHeaders)(),
            },
            await this.authHeaders(options),
            this._options.defaultHeaders,
            bodyHeaders,
            options.headers,
        ]);
        this.validateHeaders(headers);
        return headers.values;
    }
    _makeAbort(controller) {
        // note: we can't just inline this method inside `fetchWithTimeout()` because then the closure
        //       would capture all request options, and cause a memory leak.
        return () => controller.abort();
    }
    buildBody({ options }) {
        const { body, headers: rawHeaders } = options;
        if (!body) {
            // A resource method always passes a `body` key when its operation defines a
            // request body, even if the caller omitted an optional body param. Keep the
            // content-type for those, and only elide it for operations with no body at
            // all (e.g. GET/DELETE).
            if (body == null && 'body' in options) {
                return (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _Groq_encoder, "f").call(this, { body, headers: (0,_internal_headers_mjs__WEBPACK_IMPORTED_MODULE_21__.buildHeaders)([rawHeaders]) });
            }
            return { bodyHeaders: undefined, body: undefined };
        }
        const headers = (0,_internal_headers_mjs__WEBPACK_IMPORTED_MODULE_21__.buildHeaders)([rawHeaders]);
        if (
        // Pass raw type verbatim
        ArrayBuffer.isView(body) ||
            body instanceof ArrayBuffer ||
            body instanceof DataView ||
            (typeof body === 'string' &&
                // Preserve legacy string encoding behavior for now
                headers.values.has('content-type')) ||
            // `Blob` is superset of `File`
            (globalThis.Blob && body instanceof globalThis.Blob) ||
            // `FormData` -> `multipart/form-data`
            body instanceof FormData ||
            // `URLSearchParams` -> `application/x-www-form-urlencoded`
            body instanceof URLSearchParams ||
            // Send chunked stream (each chunk has own `length`)
            (globalThis.ReadableStream && body instanceof globalThis.ReadableStream)) {
            return { bodyHeaders: undefined, body: body };
        }
        else if (typeof body === 'object' &&
            (Symbol.asyncIterator in body ||
                (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))) {
            return { bodyHeaders: undefined, body: _internal_shims_mjs__WEBPACK_IMPORTED_MODULE_6__.ReadableStreamFrom(body) };
        }
        else if (typeof body === 'object' &&
            headers.values.get('content-type') === 'application/x-www-form-urlencoded') {
            return {
                bodyHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
                body: this.stringifyQuery(body),
            };
        }
        else {
            return (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _Groq_encoder, "f").call(this, { body, headers });
        }
    }
}
_a = Groq, _Groq_encoder = new WeakMap(), _Groq_instances = new WeakSet(), _Groq_baseURLOverridden = function _Groq_baseURLOverridden() {
    return this.baseURL !== 'https://api.groq.com';
};
Groq.Groq = _a;
Groq.DEFAULT_TIMEOUT = 60000; // 1 minute
Groq.GroqError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.GroqError;
Groq.APIError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIError;
Groq.APIConnectionError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIConnectionError;
Groq.APIConnectionTimeoutError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIConnectionTimeoutError;
Groq.APIUserAbortError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.APIUserAbortError;
Groq.NotFoundError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.NotFoundError;
Groq.ConflictError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.ConflictError;
Groq.RateLimitError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.RateLimitError;
Groq.BadRequestError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.BadRequestError;
Groq.AuthenticationError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.AuthenticationError;
Groq.InternalServerError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.InternalServerError;
Groq.PermissionDeniedError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.PermissionDeniedError;
Groq.UnprocessableEntityError = _core_error_mjs__WEBPACK_IMPORTED_MODULE_10__.UnprocessableEntityError;
Groq.toFile = _core_uploads_mjs__WEBPACK_IMPORTED_MODULE_11__.toFile;
Groq.Completions = _resources_completions_mjs__WEBPACK_IMPORTED_MODULE_15__.Completions;
Groq.Chat = _resources_chat_chat_mjs__WEBPACK_IMPORTED_MODULE_20__.Chat;
Groq.Embeddings = _resources_embeddings_mjs__WEBPACK_IMPORTED_MODULE_16__.Embeddings;
Groq.Audio = _resources_audio_audio_mjs__WEBPACK_IMPORTED_MODULE_19__.Audio;
Groq.Models = _resources_models_mjs__WEBPACK_IMPORTED_MODULE_18__.Models;
Groq.Batches = _resources_batches_mjs__WEBPACK_IMPORTED_MODULE_14__.Batches;
Groq.Files = _resources_files_mjs__WEBPACK_IMPORTED_MODULE_17__.Files;
//# sourceMappingURL=client.mjs.map

/***/ }),
/* 8 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet)
/* harmony export */ });
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m")
        throw new TypeError("Private method is not writable");
    if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}



/***/ }),
/* 9 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   uuid4: () => (/* binding */ uuid4)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * https://stackoverflow.com/a/2117523
 */
let uuid4 = function () {
    const { crypto } = globalThis;
    if (crypto?.randomUUID) {
        uuid4 = crypto.randomUUID.bind(crypto);
        return crypto.randomUUID();
    }
    const u8 = new Uint8Array(1);
    const randomByte = crypto ? () => crypto.getRandomValues(u8)[0] : () => (Math.random() * 0xff) & 0xff;
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (+c ^ (randomByte() & (15 >> (+c / 4)))).toString(16));
};
//# sourceMappingURL=uuid.mjs.map

/***/ }),
/* 10 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   coerceBoolean: () => (/* binding */ coerceBoolean),
/* harmony export */   coerceFloat: () => (/* binding */ coerceFloat),
/* harmony export */   coerceInteger: () => (/* binding */ coerceInteger),
/* harmony export */   ensurePresent: () => (/* binding */ ensurePresent),
/* harmony export */   hasOwn: () => (/* binding */ hasOwn),
/* harmony export */   isAbsoluteURL: () => (/* binding */ isAbsoluteURL),
/* harmony export */   isArray: () => (/* binding */ isArray),
/* harmony export */   isEmptyObj: () => (/* binding */ isEmptyObj),
/* harmony export */   isObj: () => (/* binding */ isObj),
/* harmony export */   isReadonlyArray: () => (/* binding */ isReadonlyArray),
/* harmony export */   maybeCoerceBoolean: () => (/* binding */ maybeCoerceBoolean),
/* harmony export */   maybeCoerceFloat: () => (/* binding */ maybeCoerceFloat),
/* harmony export */   maybeCoerceInteger: () => (/* binding */ maybeCoerceInteger),
/* harmony export */   maybeObj: () => (/* binding */ maybeObj),
/* harmony export */   safeJSON: () => (/* binding */ safeJSON),
/* harmony export */   validatePositiveInteger: () => (/* binding */ validatePositiveInteger)
/* harmony export */ });
/* harmony import */ var _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

// https://url.spec.whatwg.org/#url-scheme-string
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url) => {
    return startsWithSchemeRegexp.test(url);
};
let isArray = (val) => ((isArray = Array.isArray), isArray(val));
let isReadonlyArray = isArray;
/** Returns an object if the given value isn't an object, otherwise returns as-is */
function maybeObj(x) {
    if (typeof x !== 'object') {
        return {};
    }
    return x ?? {};
}
// https://stackoverflow.com/a/34491287
function isEmptyObj(obj) {
    if (!obj)
        return true;
    for (const _k in obj)
        return false;
    return true;
}
// https://eslint.org/docs/latest/rules/no-prototype-builtins
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj);
}
const ensurePresent = (value) => {
    if (value == null) {
        throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`Expected a value to be given but received ${value} instead.`);
    }
    return value;
};
const validatePositiveInteger = (name, n) => {
    if (typeof n !== 'number' || !Number.isInteger(n)) {
        throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`${name} must be an integer`);
    }
    if (n < 0) {
        throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`${name} must be a positive integer`);
    }
    return n;
};
const coerceInteger = (value) => {
    if (typeof value === 'number')
        return Math.round(value);
    if (typeof value === 'string')
        return parseInt(value, 10);
    throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`Could not coerce ${value} (type: ${typeof value}) into a number`);
};
const coerceFloat = (value) => {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string')
        return parseFloat(value);
    throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`Could not coerce ${value} (type: ${typeof value}) into a number`);
};
const coerceBoolean = (value) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string')
        return value === 'true';
    return Boolean(value);
};
const maybeCoerceInteger = (value) => {
    if (value == null) {
        return undefined;
    }
    return coerceInteger(value);
};
const maybeCoerceFloat = (value) => {
    if (value == null) {
        return undefined;
    }
    return coerceFloat(value);
};
const maybeCoerceBoolean = (value) => {
    if (value == null) {
        return undefined;
    }
    return coerceBoolean(value);
};
const safeJSON = (text) => {
    try {
        return JSON.parse(text);
    }
    catch (err) {
        return undefined;
    }
};
//# sourceMappingURL=values.mjs.map

/***/ }),
/* 11 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APIConnectionError: () => (/* binding */ APIConnectionError),
/* harmony export */   APIConnectionTimeoutError: () => (/* binding */ APIConnectionTimeoutError),
/* harmony export */   APIError: () => (/* binding */ APIError),
/* harmony export */   APIUserAbortError: () => (/* binding */ APIUserAbortError),
/* harmony export */   AuthenticationError: () => (/* binding */ AuthenticationError),
/* harmony export */   BadRequestError: () => (/* binding */ BadRequestError),
/* harmony export */   ConflictError: () => (/* binding */ ConflictError),
/* harmony export */   GroqError: () => (/* binding */ GroqError),
/* harmony export */   InternalServerError: () => (/* binding */ InternalServerError),
/* harmony export */   NotFoundError: () => (/* binding */ NotFoundError),
/* harmony export */   PermissionDeniedError: () => (/* binding */ PermissionDeniedError),
/* harmony export */   RateLimitError: () => (/* binding */ RateLimitError),
/* harmony export */   UnprocessableEntityError: () => (/* binding */ UnprocessableEntityError)
/* harmony export */ });
/* harmony import */ var _internal_errors_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

class GroqError extends Error {
}
class APIError extends GroqError {
    constructor(status, error, message, headers) {
        super(`${APIError.makeMessage(status, error, message)}`);
        this.status = status;
        this.headers = headers;
        this.error = error;
    }
    static makeMessage(status, error, message) {
        const msg = error?.message ?
            typeof error.message === 'string' ?
                error.message
                : JSON.stringify(error.message)
            : error ? JSON.stringify(error)
                : message;
        if (status && msg) {
            return `${status} ${msg}`;
        }
        if (status) {
            return `${status} status code (no body)`;
        }
        if (msg) {
            return msg;
        }
        return '(no status code or body)';
    }
    static generate(status, errorResponse, message, headers) {
        if (!status || !headers) {
            return new APIConnectionError({ message, cause: (0,_internal_errors_mjs__WEBPACK_IMPORTED_MODULE_0__.castToError)(errorResponse) });
        }
        const error = errorResponse;
        if (status === 400) {
            return new BadRequestError(status, error, message, headers);
        }
        if (status === 401) {
            return new AuthenticationError(status, error, message, headers);
        }
        if (status === 403) {
            return new PermissionDeniedError(status, error, message, headers);
        }
        if (status === 404) {
            return new NotFoundError(status, error, message, headers);
        }
        if (status === 409) {
            return new ConflictError(status, error, message, headers);
        }
        if (status === 422) {
            return new UnprocessableEntityError(status, error, message, headers);
        }
        if (status === 429) {
            return new RateLimitError(status, error, message, headers);
        }
        if (status >= 500) {
            return new InternalServerError(status, error, message, headers);
        }
        return new APIError(status, error, message, headers);
    }
}
class APIUserAbortError extends APIError {
    constructor({ message } = {}) {
        super(undefined, undefined, message || 'Request was aborted.', undefined);
    }
}
class APIConnectionError extends APIError {
    constructor({ message, cause }) {
        super(undefined, undefined, message || 'Connection error.', undefined);
        // in some environments the 'cause' property is already declared
        // @ts-ignore
        if (cause)
            this.cause = cause;
    }
}
class APIConnectionTimeoutError extends APIConnectionError {
    constructor({ message } = {}) {
        super({ message: message ?? 'Request timed out.' });
    }
}
class BadRequestError extends APIError {
}
class AuthenticationError extends APIError {
}
class PermissionDeniedError extends APIError {
}
class NotFoundError extends APIError {
}
class ConflictError extends APIError {
}
class UnprocessableEntityError extends APIError {
}
class RateLimitError extends APIError {
}
class InternalServerError extends APIError {
}
//# sourceMappingURL=error.mjs.map

/***/ }),
/* 12 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   castToError: () => (/* binding */ castToError),
/* harmony export */   isAbortError: () => (/* binding */ isAbortError)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
function isAbortError(err) {
    return (typeof err === 'object' &&
        err !== null &&
        // Spec-compliant fetch implementations
        (('name' in err && err.name === 'AbortError') ||
            // Expo fetch
            ('message' in err && String(err.message).includes('FetchRequestCanceledException'))));
}
const castToError = (err) => {
    if (err instanceof Error)
        return err;
    if (typeof err === 'object' && err !== null) {
        try {
            if (Object.prototype.toString.call(err) === '[object Error]') {
                // @ts-ignore - not all envs have native support for cause yet
                const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
                if (err.stack)
                    error.stack = err.stack;
                // @ts-ignore - not all envs have native support for cause yet
                if (err.cause && !error.cause)
                    error.cause = err.cause;
                if (err.name)
                    error.name = err.name;
                return error;
            }
        }
        catch { }
        try {
            return new Error(JSON.stringify(err));
        }
        catch { }
    }
    return new Error(err);
};
//# sourceMappingURL=errors.mjs.map

/***/ }),
/* 13 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sleep: () => (/* binding */ sleep)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//# sourceMappingURL=sleep.mjs.map

/***/ }),
/* 14 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPlatformHeaders: () => (/* binding */ getPlatformHeaders),
/* harmony export */   isRunningInBrowser: () => (/* binding */ isRunningInBrowser)
/* harmony export */ });
/* harmony import */ var _version_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

const isRunningInBrowser = () => {
    return (
    // @ts-ignore
    typeof window !== 'undefined' &&
        // @ts-ignore
        typeof window.document !== 'undefined' &&
        // @ts-ignore
        typeof navigator !== 'undefined');
};
/**
 * Note this does not detect 'browser'; for that, use getBrowserInfo().
 */
function getDetectedPlatform() {
    if (typeof Deno !== 'undefined' && Deno.build != null) {
        return 'deno';
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return 'edge';
    }
    if (Object.prototype.toString.call(typeof globalThis.process !== 'undefined' ? globalThis.process : 0) === '[object process]') {
        return 'node';
    }
    return 'unknown';
}
const getPlatformProperties = () => {
    const detectedPlatform = getDetectedPlatform();
    if (detectedPlatform === 'deno') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': _version_mjs__WEBPACK_IMPORTED_MODULE_0__.VERSION,
            'X-Stainless-OS': normalizePlatform(Deno.build.os),
            'X-Stainless-Arch': normalizeArch(Deno.build.arch),
            'X-Stainless-Runtime': 'deno',
            'X-Stainless-Runtime-Version': typeof Deno.version === 'string' ? Deno.version : Deno.version?.deno ?? 'unknown',
        };
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': _version_mjs__WEBPACK_IMPORTED_MODULE_0__.VERSION,
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': `other:${EdgeRuntime}`,
            'X-Stainless-Runtime': 'edge',
            'X-Stainless-Runtime-Version': globalThis.process.version,
        };
    }
    // Check if Node.js
    if (detectedPlatform === 'node') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': _version_mjs__WEBPACK_IMPORTED_MODULE_0__.VERSION,
            'X-Stainless-OS': normalizePlatform(globalThis.process.platform ?? 'unknown'),
            'X-Stainless-Arch': normalizeArch(globalThis.process.arch ?? 'unknown'),
            'X-Stainless-Runtime': 'node',
            'X-Stainless-Runtime-Version': globalThis.process.version ?? 'unknown',
        };
    }
    const browserInfo = getBrowserInfo();
    if (browserInfo) {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': _version_mjs__WEBPACK_IMPORTED_MODULE_0__.VERSION,
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': 'unknown',
            'X-Stainless-Runtime': `browser:${browserInfo.browser}`,
            'X-Stainless-Runtime-Version': browserInfo.version,
        };
    }
    // TODO add support for Cloudflare workers, etc.
    return {
        'X-Stainless-Lang': 'js',
        'X-Stainless-Package-Version': _version_mjs__WEBPACK_IMPORTED_MODULE_0__.VERSION,
        'X-Stainless-OS': 'Unknown',
        'X-Stainless-Arch': 'unknown',
        'X-Stainless-Runtime': 'unknown',
        'X-Stainless-Runtime-Version': 'unknown',
    };
};
// Note: modified from https://github.com/JS-DevTools/host-environment/blob/b1ab79ecde37db5d6e163c050e54fe7d287d7c92/src/isomorphic.browser.ts
function getBrowserInfo() {
    if (typeof navigator === 'undefined' || !navigator) {
        return null;
    }
    // NOTE: The order matters here!
    const browserPatterns = [
        { key: 'edge', pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'ie', pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'ie', pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'chrome', pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'firefox', pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'safari', pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ },
    ];
    // Find the FIRST matching browser
    for (const { key, pattern } of browserPatterns) {
        const match = pattern.exec(navigator.userAgent);
        if (match) {
            const major = match[1] || 0;
            const minor = match[2] || 0;
            const patch = match[3] || 0;
            return { browser: key, version: `${major}.${minor}.${patch}` };
        }
    }
    return null;
}
const normalizeArch = (arch) => {
    // Node docs:
    // - https://nodejs.org/api/process.html#processarch
    // Deno docs:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    if (arch === 'x32')
        return 'x32';
    if (arch === 'x86_64' || arch === 'x64')
        return 'x64';
    if (arch === 'arm')
        return 'arm';
    if (arch === 'aarch64' || arch === 'arm64')
        return 'arm64';
    if (arch)
        return `other:${arch}`;
    return 'unknown';
};
const normalizePlatform = (platform) => {
    // Node platforms:
    // - https://nodejs.org/api/process.html#processplatform
    // Deno platforms:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    // - https://github.com/denoland/deno/issues/14799
    platform = platform.toLowerCase();
    // NOTE: this iOS check is untested and may not work
    // Node does not work natively on IOS, there is a fork at
    // https://github.com/nodejs-mobile/nodejs-mobile
    // however it is unknown at the time of writing how to detect if it is running
    if (platform.includes('ios'))
        return 'iOS';
    if (platform === 'android')
        return 'Android';
    if (platform === 'darwin')
        return 'MacOS';
    if (platform === 'win32')
        return 'Windows';
    if (platform === 'freebsd')
        return 'FreeBSD';
    if (platform === 'openbsd')
        return 'OpenBSD';
    if (platform === 'linux')
        return 'Linux';
    if (platform)
        return `Other:${platform}`;
    return 'Unknown';
};
let _platformHeaders;
const getPlatformHeaders = () => {
    return (_platformHeaders ?? (_platformHeaders = getPlatformProperties()));
};
//# sourceMappingURL=detect-platform.mjs.map

/***/ }),
/* 15 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VERSION: () => (/* binding */ VERSION)
/* harmony export */ });
const VERSION = '1.6.0'; // x-release-please-version
//# sourceMappingURL=version.mjs.map

/***/ }),
/* 16 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CancelReadableStream: () => (/* binding */ CancelReadableStream),
/* harmony export */   ReadableStreamFrom: () => (/* binding */ ReadableStreamFrom),
/* harmony export */   ReadableStreamToAsyncIterable: () => (/* binding */ ReadableStreamToAsyncIterable),
/* harmony export */   getDefaultFetch: () => (/* binding */ getDefaultFetch),
/* harmony export */   makeReadableStream: () => (/* binding */ makeReadableStream)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
function getDefaultFetch() {
    if (typeof fetch !== 'undefined') {
        return fetch;
    }
    throw new Error('`fetch` is not defined as a global; Either pass `fetch` to the client, `new Groq({ fetch })` or polyfill the global, `globalThis.fetch = fetch`');
}
function makeReadableStream(...args) {
    const ReadableStream = globalThis.ReadableStream;
    if (typeof ReadableStream === 'undefined') {
        // Note: All of the platforms / runtimes we officially support already define
        // `ReadableStream` as a global, so this should only ever be hit on unsupported runtimes.
        throw new Error('`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`');
    }
    return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
    let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
    return makeReadableStream({
        start() { },
        async pull(controller) {
            const { done, value } = await iter.next();
            if (done) {
                controller.close();
            }
            else {
                controller.enqueue(value);
            }
        },
        async cancel() {
            await iter.return?.();
        },
    });
}
/**
 * Most browsers don't yet have async iterable support for ReadableStream,
 * and Node has a very different way of reading bytes from its "ReadableStream".
 *
 * This polyfill was pulled from https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
 */
function ReadableStreamToAsyncIterable(stream) {
    if (stream[Symbol.asyncIterator])
        return stream;
    const reader = stream.getReader();
    return {
        async next() {
            try {
                const result = await reader.read();
                if (result?.done)
                    reader.releaseLock(); // release lock when stream becomes closed
                return result;
            }
            catch (e) {
                reader.releaseLock(); // release lock when stream becomes errored
                throw e;
            }
        },
        async return() {
            const cancelPromise = reader.cancel();
            reader.releaseLock();
            await cancelPromise;
            return { done: true, value: undefined };
        },
        [Symbol.asyncIterator]() {
            return this;
        },
    };
}
/**
 * Cancels a ReadableStream we don't need to consume.
 * See https://undici.nodejs.org/#/?id=garbage-collection
 */
async function CancelReadableStream(stream) {
    if (stream === null || typeof stream !== 'object')
        return;
    if (stream[Symbol.asyncIterator]) {
        await stream[Symbol.asyncIterator]().return?.();
        return;
    }
    const reader = stream.getReader();
    const cancelPromise = reader.cancel();
    reader.releaseLock();
    await cancelPromise;
}
//# sourceMappingURL=shims.mjs.map

/***/ }),
/* 17 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FallbackEncoder: () => (/* binding */ FallbackEncoder)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
const FallbackEncoder = ({ headers, body }) => {
    return {
        bodyHeaders: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    };
};
//# sourceMappingURL=request-options.mjs.map

/***/ }),
/* 18 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyQuery: () => (/* binding */ stringifyQuery)
/* harmony export */ });
/* harmony import */ var _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/**
 * Basic re-implementation of `qs.stringify` for primitive types.
 */
function stringifyQuery(query) {
    return Object.entries(query)
        .filter(([_, value]) => typeof value !== 'undefined')
        .map(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
        if (value === null) {
            return `${encodeURIComponent(key)}=`;
        }
        throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    })
        .join('&');
}
//# sourceMappingURL=query.mjs.map

/***/ }),
/* 19 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toFile: () => (/* reexport safe */ _internal_to_file_mjs__WEBPACK_IMPORTED_MODULE_0__.toFile)
/* harmony export */ });
/* harmony import */ var _internal_to_file_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(20);

//# sourceMappingURL=uploads.mjs.map

/***/ }),
/* 20 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toFile: () => (/* binding */ toFile)
/* harmony export */ });
/* harmony import */ var _uploads_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(21);


/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */
const isBlobLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.text === 'function' &&
    typeof value.slice === 'function' &&
    typeof value.arrayBuffer === 'function';
/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */
const isFileLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.lastModified === 'number' &&
    isBlobLike(value);
const isResponseLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.url === 'string' &&
    typeof value.blob === 'function';
/**
 * Helper for creating a {@link File} to pass to an SDK upload method from a variety of different data formats
 * @param value the raw content of the file. Can be an {@link Uploadable}, BlobLikePart, or AsyncIterable of BlobLikeParts
 * @param {string=} name the name of the file. If omitted, toFile will try to determine a file name from bits if possible
 * @param {Object=} options additional properties
 * @param {string=} options.type the MIME type of the content
 * @param {number=} options.lastModified the last modified timestamp
 * @returns a {@link File} with the given properties
 */
async function toFile(value, name, options) {
    (0,_uploads_mjs__WEBPACK_IMPORTED_MODULE_0__.checkFileSupport)();
    // If it's a promise, resolve it.
    value = await value;
    // If we've been given a `File` we don't need to do anything
    if (isFileLike(value)) {
        if (value instanceof File) {
            return value;
        }
        return (0,_uploads_mjs__WEBPACK_IMPORTED_MODULE_0__.makeFile)([await value.arrayBuffer()], value.name);
    }
    if (isResponseLike(value)) {
        const blob = await value.blob();
        name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
        return (0,_uploads_mjs__WEBPACK_IMPORTED_MODULE_0__.makeFile)(await getBytes(blob), name, options);
    }
    const parts = await getBytes(value);
    name || (name = (0,_uploads_mjs__WEBPACK_IMPORTED_MODULE_0__.getName)(value));
    if (!options?.type) {
        const type = parts.find((part) => typeof part === 'object' && 'type' in part && part.type);
        if (typeof type === 'string') {
            options = { ...options, type };
        }
    }
    return (0,_uploads_mjs__WEBPACK_IMPORTED_MODULE_0__.makeFile)(parts, name, options);
}
async function getBytes(value) {
    let parts = [];
    if (typeof value === 'string' ||
        ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
        value instanceof ArrayBuffer) {
        parts.push(value);
    }
    else if (isBlobLike(value)) {
        parts.push(value instanceof Blob ? value : await value.arrayBuffer());
    }
    else if ((0,_uploads_mjs__WEBPACK_IMPORTED_MODULE_0__.isAsyncIterable)(value) // includes Readable, ReadableStream, etc.
    ) {
        for await (const chunk of value) {
            parts.push(...(await getBytes(chunk))); // TODO, consider validating?
        }
    }
    else {
        const constructor = value?.constructor?.name;
        throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ''}${propsForError(value)}`);
    }
    return parts;
}
function propsForError(value) {
    if (typeof value !== 'object' || value === null)
        return '';
    const props = Object.getOwnPropertyNames(value);
    return `; props: [${props.map((p) => `"${p}"`).join(', ')}]`;
}
//# sourceMappingURL=to-file.mjs.map

/***/ }),
/* 21 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkFileSupport: () => (/* binding */ checkFileSupport),
/* harmony export */   createForm: () => (/* binding */ createForm),
/* harmony export */   getName: () => (/* binding */ getName),
/* harmony export */   isAsyncIterable: () => (/* binding */ isAsyncIterable),
/* harmony export */   makeFile: () => (/* binding */ makeFile),
/* harmony export */   maybeMultipartFormRequestOptions: () => (/* binding */ maybeMultipartFormRequestOptions),
/* harmony export */   multipartFormRequestOptions: () => (/* binding */ multipartFormRequestOptions)
/* harmony export */ });
/* harmony import */ var _shims_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);

const checkFileSupport = () => {
    if (typeof File === 'undefined') {
        const { process } = globalThis;
        const isOldNode = typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')) < 20;
        throw new Error('`File` is not defined as a global, which is required for file uploads.' +
            (isOldNode ?
                " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
                : ''));
    }
};
/**
 * Construct a `File` instance. This is used to ensure a helpful error is thrown
 * for environments that don't define a global `File` yet.
 */
function makeFile(fileBits, fileName, options) {
    checkFileSupport();
    return new File(fileBits, fileName ?? 'unknown_file', options);
}
function getName(value) {
    return (((typeof value === 'object' &&
        value !== null &&
        (('name' in value && value.name && String(value.name)) ||
            ('url' in value && value.url && String(value.url)) ||
            ('filename' in value && value.filename && String(value.filename)) ||
            ('path' in value && value.path && String(value.path)))) ||
        '')
        .split(/[\\/]/)
        .pop() || undefined);
}
const isAsyncIterable = (value) => value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';
/**
 * Returns a multipart/form-data request if any part of the given request body contains a File / Blob value.
 * Otherwise returns the request as is.
 */
const maybeMultipartFormRequestOptions = async (opts, fetch) => {
    if (!hasUploadableValue(opts.body))
        return opts;
    return { ...opts, body: await createForm(opts.body, fetch) };
};
const multipartFormRequestOptions = async (opts, fetch) => {
    return { ...opts, body: await createForm(opts.body, fetch) };
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
/**
 * node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
 * properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
 * This function detects if the fetch function provided supports the global FormData object to avoid
 * confusing error messages later on.
 */
function supportsFormData(fetchObject) {
    const fetch = typeof fetchObject === 'function' ? fetchObject : fetchObject.fetch;
    const cached = supportsFormDataMap.get(fetch);
    if (cached)
        return cached;
    const promise = (async () => {
        try {
            const FetchResponse = ('Response' in fetch ?
                fetch.Response
                : (await fetch('data:,')).constructor);
            const data = new FormData();
            if (data.toString() === (await new FetchResponse(data).text())) {
                return false;
            }
            return true;
        }
        catch {
            // avoid false negatives
            return true;
        }
    })();
    supportsFormDataMap.set(fetch, promise);
    return promise;
}
const createForm = async (body, fetch) => {
    if (!(await supportsFormData(fetch))) {
        throw new TypeError('The provided fetch function does not support file uploads with the current global FormData class.');
    }
    const form = new FormData();
    await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
    return form;
};
// We check for Blob not File because Bun.File doesn't inherit from File,
// but they both inherit from Blob and have a `name` property at runtime.
const isNamedBlob = (value) => value instanceof Blob && 'name' in value;
const isUploadable = (value) => typeof value === 'object' &&
    value !== null &&
    (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));
const hasUploadableValue = (value) => {
    if (isUploadable(value))
        return true;
    if (Array.isArray(value))
        return value.some(hasUploadableValue);
    if (value && typeof value === 'object') {
        for (const k in value) {
            if (hasUploadableValue(value[k]))
                return true;
        }
    }
    return false;
};
const addFormValue = async (form, key, value) => {
    if (value === undefined)
        return;
    if (value == null) {
        throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
    }
    // TODO: make nested formats configurable
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        form.append(key, String(value));
    }
    else if (value instanceof Response) {
        form.append(key, makeFile([await value.blob()], getName(value)));
    }
    else if (isAsyncIterable(value)) {
        form.append(key, makeFile([await new Response((0,_shims_mjs__WEBPACK_IMPORTED_MODULE_0__.ReadableStreamFrom)(value)).blob()], getName(value)));
    }
    else if (isNamedBlob(value)) {
        form.append(key, value, getName(value));
    }
    else if (Array.isArray(value)) {
        await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry)));
    }
    else if (typeof value === 'object') {
        await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
    }
    else {
        throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
    }
};
//# sourceMappingURL=uploads.mjs.map

/***/ }),
/* 22 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Audio: () => (/* reexport safe */ _audio_audio_mjs__WEBPACK_IMPORTED_MODULE_1__.Audio),
/* harmony export */   Batches: () => (/* reexport safe */ _batches_mjs__WEBPACK_IMPORTED_MODULE_2__.Batches),
/* harmony export */   Chat: () => (/* reexport safe */ _chat_chat_mjs__WEBPACK_IMPORTED_MODULE_3__.Chat),
/* harmony export */   Completions: () => (/* reexport safe */ _completions_mjs__WEBPACK_IMPORTED_MODULE_4__.Completions),
/* harmony export */   Embeddings: () => (/* reexport safe */ _embeddings_mjs__WEBPACK_IMPORTED_MODULE_5__.Embeddings),
/* harmony export */   Files: () => (/* reexport safe */ _files_mjs__WEBPACK_IMPORTED_MODULE_6__.Files),
/* harmony export */   Models: () => (/* reexport safe */ _models_mjs__WEBPACK_IMPORTED_MODULE_7__.Models)
/* harmony export */ });
/* harmony import */ var _shared_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(23);
/* harmony import */ var _audio_audio_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(24);
/* harmony import */ var _batches_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(30);
/* harmony import */ var _chat_chat_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(32);
/* harmony import */ var _completions_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34);
/* harmony import */ var _embeddings_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(35);
/* harmony import */ var _files_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(36);
/* harmony import */ var _models_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(37);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.








//# sourceMappingURL=index.mjs.map

/***/ }),
/* 23 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

//# sourceMappingURL=shared.mjs.map

/***/ }),
/* 24 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Audio: () => (/* binding */ Audio)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _speech_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26);
/* harmony import */ var _transcriptions_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(28);
/* harmony import */ var _translations_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(29);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.







class Audio extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    constructor() {
        super(...arguments);
        this.speech = new _speech_mjs__WEBPACK_IMPORTED_MODULE_1__.Speech(this._client);
        this.transcriptions = new _transcriptions_mjs__WEBPACK_IMPORTED_MODULE_2__.Transcriptions(this._client);
        this.translations = new _translations_mjs__WEBPACK_IMPORTED_MODULE_3__.Translations(this._client);
    }
}
Audio.Speech = _speech_mjs__WEBPACK_IMPORTED_MODULE_1__.Speech;
Audio.Transcriptions = _transcriptions_mjs__WEBPACK_IMPORTED_MODULE_2__.Transcriptions;
Audio.Translations = _translations_mjs__WEBPACK_IMPORTED_MODULE_3__.Translations;
//# sourceMappingURL=audio.mjs.map

/***/ }),
/* 25 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APIResource: () => (/* binding */ APIResource)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
class APIResource {
    constructor(client) {
        this._client = client;
    }
}
//# sourceMappingURL=resource.mjs.map

/***/ }),
/* 26 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Speech: () => (/* binding */ Speech)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _internal_headers_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Speech extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Generates audio from the input text.
     *
     * @example
     * ```ts
     * const speech = await client.audio.speech.create({
     *   input: 'The quick brown fox jumped over the lazy dog',
     *   model: 'playai-tts',
     *   voice: 'Fritz-PlayAI',
     * });
     *
     * const content = await speech.blob();
     * console.log(content);
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/audio/speech', {
            body,
            ...options,
            headers: (0,_internal_headers_mjs__WEBPACK_IMPORTED_MODULE_1__.buildHeaders)([{ Accept: 'audio/wav' }, options?.headers]),
            __binaryResponse: true,
        });
    }
}
//# sourceMappingURL=speech.mjs.map

/***/ }),
/* 27 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildHeaders: () => (/* binding */ buildHeaders),
/* harmony export */   isEmptyHeaders: () => (/* binding */ isEmptyHeaders)
/* harmony export */ });
/* harmony import */ var _utils_values_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

const brand_privateNullableHeaders = /* @__PURE__ */ Symbol('brand.privateNullableHeaders');
function* iterateHeaders(headers) {
    if (!headers)
        return;
    if (brand_privateNullableHeaders in headers) {
        const { values, nulls } = headers;
        yield* values.entries();
        for (const name of nulls) {
            yield [name, null];
        }
        return;
    }
    let shouldClear = false;
    let iter;
    if (headers instanceof Headers) {
        iter = headers.entries();
    }
    else if ((0,_utils_values_mjs__WEBPACK_IMPORTED_MODULE_0__.isReadonlyArray)(headers)) {
        iter = headers;
    }
    else {
        shouldClear = true;
        iter = Object.entries(headers ?? {});
    }
    for (let row of iter) {
        const name = row[0];
        if (typeof name !== 'string')
            throw new TypeError('expected header name to be a string');
        const values = (0,_utils_values_mjs__WEBPACK_IMPORTED_MODULE_0__.isReadonlyArray)(row[1]) ? row[1] : [row[1]];
        let didClear = false;
        for (const value of values) {
            if (value === undefined)
                continue;
            // Objects keys always overwrite older headers, they never append.
            // Yield a null to clear the header before adding the new values.
            if (shouldClear && !didClear) {
                didClear = true;
                yield [name, null];
            }
            yield [name, value];
        }
    }
}
const buildHeaders = (newHeaders) => {
    const targetHeaders = new Headers();
    const nullHeaders = new Set();
    for (const headers of newHeaders) {
        const seenHeaders = new Set();
        for (const [name, value] of iterateHeaders(headers)) {
            const lowerName = name.toLowerCase();
            if (!seenHeaders.has(lowerName)) {
                targetHeaders.delete(name);
                seenHeaders.add(lowerName);
            }
            if (value === null) {
                targetHeaders.delete(name);
                nullHeaders.add(lowerName);
            }
            else {
                targetHeaders.append(name, value);
                nullHeaders.delete(lowerName);
            }
        }
    }
    return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};
const isEmptyHeaders = (headers) => {
    for (const _ of iterateHeaders(headers))
        return false;
    return true;
};
//# sourceMappingURL=headers.mjs.map

/***/ }),
/* 28 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Transcriptions: () => (/* binding */ Transcriptions)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _internal_uploads_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(21);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Transcriptions extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Transcribes audio into the input language.
     *
     * @example
     * ```ts
     * const transcription =
     *   await client.audio.transcriptions.create({
     *     model: 'whisper-large-v3-turbo',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/audio/transcriptions', (0,_internal_uploads_mjs__WEBPACK_IMPORTED_MODULE_1__.multipartFormRequestOptions)({ body, ...options }, this._client));
    }
}
//# sourceMappingURL=transcriptions.mjs.map

/***/ }),
/* 29 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Translations: () => (/* binding */ Translations)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _internal_uploads_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(21);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Translations extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Translates audio into English.
     *
     * @example
     * ```ts
     * const translation = await client.audio.translations.create({
     *   model: 'whisper-large-v3-turbo',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/audio/translations', (0,_internal_uploads_mjs__WEBPACK_IMPORTED_MODULE_1__.multipartFormRequestOptions)({ body, ...options }, this._client));
    }
}
//# sourceMappingURL=translations.mjs.map

/***/ }),
/* 30 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Batches: () => (/* binding */ Batches)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(31);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Batches extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Creates and executes a batch from an uploaded file of requests.
     * [Learn more](/docs/batch).
     */
    create(body, options) {
        return this._client.post('/openai/v1/batches', { body, ...options });
    }
    /**
     * Retrieves a batch.
     */
    retrieve(batchID, options) {
        return this._client.get((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_1__.path) `/openai/v1/batches/${batchID}`, options);
    }
    /**
     * List your organization's batches.
     */
    list(options) {
        return this._client.get('/openai/v1/batches', options);
    }
    /**
     * Cancels a batch.
     */
    cancel(batchID, options) {
        return this._client.post((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_1__.path) `/openai/v1/batches/${batchID}/cancel`, options);
    }
}
//# sourceMappingURL=batches.mjs.map

/***/ }),
/* 31 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createPathTagFunction: () => (/* binding */ createPathTagFunction),
/* harmony export */   encodeURIPath: () => (/* binding */ encodeURIPath),
/* harmony export */   path: () => (/* binding */ path)
/* harmony export */ });
/* harmony import */ var _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);

/**
 * Percent-encode everything that isn't safe to have in a path without encoding safe chars.
 *
 * Taken from https://datatracker.ietf.org/doc/html/rfc3986#section-3.3:
 * > unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
 * > sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * > pchar       = unreserved / pct-encoded / sub-delims / ":" / "@"
 */
function encodeURIPath(str) {
    return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path(statics, ...params) {
    // If there are no params, no processing is needed.
    if (statics.length === 1)
        return statics[0];
    let postPath = false;
    const invalidSegments = [];
    const path = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
            postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)('' + value);
        if (index !== params.length &&
            (value == null ||
                (typeof value === 'object' &&
                    // handle values from other realms
                    value.toString ===
                        Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)
                            ?.toString))) {
            encoded = value + '';
            invalidSegments.push({
                start: previousValue.length + currentValue.length,
                length: encoded.length,
                error: `Value of type ${Object.prototype.toString
                    .call(value)
                    .slice(8, -1)} is not a valid path parameter`,
            });
        }
        return previousValue + currentValue + (index === params.length ? '' : encoded);
    }, '');
    const pathOnly = path.split(/[?#]/, 1)[0];
    const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
    let match;
    // Find all invalid segments
    while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
            start: match.index,
            length: match[0].length,
            error: `Value "${match[0]}" can\'t be safely passed as a path parameter`,
        });
    }
    invalidSegments.sort((a, b) => a.start - b.start);
    if (invalidSegments.length > 0) {
        let lastEnd = 0;
        const underline = invalidSegments.reduce((acc, segment) => {
            const spaces = ' '.repeat(segment.start - lastEnd);
            const arrows = '^'.repeat(segment.length);
            lastEnd = segment.start + segment.length;
            return acc + spaces + arrows;
        }, '');
        throw new _core_error_mjs__WEBPACK_IMPORTED_MODULE_0__.GroqError(`Path parameters result in path with invalid segments:\n${invalidSegments
            .map((e) => e.error)
            .join('\n')}\n${path}\n${underline}`);
    }
    return path;
};
/**
 * URI-encodes path params and ensures no unsafe /./ or /../ path segments are introduced.
 */
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
//# sourceMappingURL=path.mjs.map

/***/ }),
/* 32 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Chat: () => (/* binding */ Chat)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _completions_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.



class Chat extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    constructor() {
        super(...arguments);
        this.completions = new _completions_mjs__WEBPACK_IMPORTED_MODULE_1__.Completions(this._client);
    }
}
Chat.Completions = _completions_mjs__WEBPACK_IMPORTED_MODULE_1__.Completions;
//# sourceMappingURL=chat.mjs.map

/***/ }),
/* 33 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Completions: () => (/* binding */ Completions)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

class Completions extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    create(body, options) {
        return this._client.post('/openai/v1/chat/completions', {
            body,
            ...options,
            stream: body.stream ?? false,
        });
    }
}
//# sourceMappingURL=completions.mjs.map

/***/ }),
/* 34 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Completions: () => (/* binding */ Completions)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

class Completions extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
}
//# sourceMappingURL=completions.mjs.map

/***/ }),
/* 35 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Embeddings: () => (/* binding */ Embeddings)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

class Embeddings extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Creates an embedding vector representing the input text.
     *
     * @example
     * ```ts
     * const createEmbeddingResponse =
     *   await client.embeddings.create({
     *     input: 'The quick brown fox jumped over the lazy dog',
     *     model: 'nomic-embed-text-v1_5',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/openai/v1/embeddings', { body, ...options });
    }
}
//# sourceMappingURL=embeddings.mjs.map

/***/ }),
/* 36 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Files: () => (/* binding */ Files)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _internal_headers_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(27);
/* harmony import */ var _internal_uploads_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(21);
/* harmony import */ var _internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(31);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.




class Files extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Upload a file that can be used across various endpoints.
     *
     * The Batch API only supports `.jsonl` files up to 100 MB in size. The input also
     * has a specific required [format](/docs/batch).
     *
     * Please contact us if you need to increase these storage limits.
     */
    create(body, options) {
        return this._client.post('/openai/v1/files', (0,_internal_uploads_mjs__WEBPACK_IMPORTED_MODULE_2__.multipartFormRequestOptions)({ body, ...options }, this._client));
    }
    /**
     * Returns a list of files.
     */
    list(options) {
        return this._client.get('/openai/v1/files', options);
    }
    /**
     * Delete a file.
     */
    delete(fileID, options) {
        return this._client.delete((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_3__.path) `/openai/v1/files/${fileID}`, options);
    }
    /**
     * Returns the contents of the specified file.
     */
    content(fileID, options) {
        return this._client.get((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_3__.path) `/openai/v1/files/${fileID}/content`, {
            ...options,
            headers: (0,_internal_headers_mjs__WEBPACK_IMPORTED_MODULE_1__.buildHeaders)([{ Accept: 'application/octet-stream' }, options?.headers]),
            __binaryResponse: true,
        });
    }
    /**
     * Returns information about a file.
     */
    info(fileID, options) {
        return this._client.get((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_3__.path) `/openai/v1/files/${fileID}`, options);
    }
}
//# sourceMappingURL=files.mjs.map

/***/ }),
/* 37 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Models: () => (/* binding */ Models)
/* harmony export */ });
/* harmony import */ var _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(31);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


class Models extends _core_resource_mjs__WEBPACK_IMPORTED_MODULE_0__.APIResource {
    /**
     * Get a specific model
     */
    retrieve(model, options) {
        return this._client.get((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_1__.path) `/openai/v1/models/${model}`, options);
    }
    /**
     * get all available models
     */
    list(options) {
        return this._client.get('/openai/v1/models', options);
    }
    /**
     * Delete a model
     */
    delete(model, options) {
        return this._client.delete((0,_internal_utils_path_mjs__WEBPACK_IMPORTED_MODULE_1__.path) `/openai/v1/models/${model}`, options);
    }
}
//# sourceMappingURL=models.mjs.map

/***/ }),
/* 38 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APIPromise: () => (/* binding */ APIPromise)
/* harmony export */ });
/* harmony import */ var _internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _internal_parse_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _APIPromise_client;


/**
 * A subclass of `Promise` providing additional helper methods
 * for interacting with the SDK.
 */
class APIPromise extends Promise {
    constructor(client, responsePromise, parseResponse = _internal_parse_mjs__WEBPACK_IMPORTED_MODULE_1__.defaultParseResponse) {
        super((resolve) => {
            // this is maybe a bit weird but this has to be a no-op to not implicitly
            // parse the response body; instead .then, .catch, .finally are overridden
            // to parse the response
            resolve(null);
        });
        this.responsePromise = responsePromise;
        this.parseResponse = parseResponse;
        _APIPromise_client.set(this, void 0);
        (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _APIPromise_client, client, "f");
    }
    _thenUnwrap(transform) {
        return new APIPromise((0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => transform(await this.parseResponse(client, props), props));
    }
    /**
     * Gets the raw `Response` instance instead of parsing the response
     * data.
     *
     * If you want to parse the response body but still get the `Response`
     * instance, you can use {@link withResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
     * to your `tsconfig.json`.
     */
    asResponse() {
        return this.responsePromise.then((p) => p.response);
    }
    /**
     * Gets the parsed response data and the raw `Response` instance.
     *
     * If you just want to get the raw `Response` instance without parsing it,
     * you can use {@link asResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
     * to your `tsconfig.json`.
     */
    async withResponse() {
        const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
        return { data, response };
    }
    parse() {
        if (!this.parsedPromise) {
            this.parsedPromise = this.responsePromise.then((data) => this.parseResponse((0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _APIPromise_client, "f"), data));
        }
        return this.parsedPromise;
    }
    then(onfulfilled, onrejected) {
        return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.parse().catch(onrejected);
    }
    finally(onfinally) {
        return this.parse().finally(onfinally);
    }
}
_APIPromise_client = new WeakMap();
//# sourceMappingURL=api-promise.mjs.map

/***/ }),
/* 39 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultParseResponse: () => (/* binding */ defaultParseResponse)
/* harmony export */ });
/* harmony import */ var _core_streaming_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(40);
/* harmony import */ var _utils_log_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.


async function defaultParseResponse(client, props) {
    const { response, requestLogID, retryOfRequestLogID, startTime } = props;
    const body = await (async () => {
        // fetch refuses to read the body when the status code is 204.
        if (response.status === 204) {
            return null;
        }
        if (props.options.__binaryResponse) {
            return response;
        }
        if (props.options.stream) {
            return _core_streaming_mjs__WEBPACK_IMPORTED_MODULE_0__.Stream.fromSSEResponse(response, props.controller, client);
        }
        const contentType = response.headers.get('content-type');
        const mediaType = contentType?.split(';')[0]?.trim();
        const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
        if (isJSON) {
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                // if there is no content we can't do anything
                return undefined;
            }
            const json = await response.json();
            return json;
        }
        const text = await response.text();
        return text;
    })();
    (0,_utils_log_mjs__WEBPACK_IMPORTED_MODULE_1__.loggerFor)(client).debug(`[${requestLogID}] response parsed`, (0,_utils_log_mjs__WEBPACK_IMPORTED_MODULE_1__.formatRequestDetails)({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        body,
        durationMs: Date.now() - startTime,
    }));
    return body;
}
//# sourceMappingURL=parse.mjs.map

/***/ }),
/* 40 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Stream: () => (/* binding */ Stream),
/* harmony export */   _iterSSEMessages: () => (/* binding */ _iterSSEMessages)
/* harmony export */ });
/* harmony import */ var _internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _error_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _internal_shims_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(16);
/* harmony import */ var _internal_decoders_line_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(41);
/* harmony import */ var _internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(12);
/* harmony import */ var _internal_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(42);
/* harmony import */ var _internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(43);
var _Stream_client;









class Stream {
    constructor(iterator, controller, client) {
        this.iterator = iterator;
        _Stream_client.set(this, void 0);
        this.controller = controller;
        (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _Stream_client, client, "f");
    }
    static fromSSEResponse(response, controller, client) {
        let consumed = false;
        const logger = client ? (0,_internal_utils_log_mjs__WEBPACK_IMPORTED_MODULE_6__.loggerFor)(client) : console;
        async function* iterator() {
            if (consumed) {
                throw new _error_mjs__WEBPACK_IMPORTED_MODULE_1__.GroqError('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
            }
            consumed = true;
            let done = false;
            try {
                for await (const sse of _iterSSEMessages(response, controller)) {
                    if (done)
                        continue;
                    if (sse.data.startsWith('[DONE]')) {
                        done = true;
                        continue;
                    }
                    if (sse.event === null || !sse.event.startsWith('thread.')) {
                        let data;
                        try {
                            data = JSON.parse(sse.data);
                        }
                        catch (e) {
                            logger.error(`Could not parse message into JSON:`, sse.data);
                            logger.error(`From chunk:`, sse.raw);
                            throw e;
                        }
                        if (data && data.error) {
                            throw new _error_mjs__WEBPACK_IMPORTED_MODULE_1__.APIError(undefined, data.error, undefined, response.headers);
                        }
                        yield data;
                    }
                    else {
                        let data;
                        try {
                            data = JSON.parse(sse.data);
                        }
                        catch (e) {
                            console.error(`Could not parse message into JSON:`, sse.data);
                            console.error(`From chunk:`, sse.raw);
                            throw e;
                        }
                        // TODO: Is this where the error should be thrown?
                        if (sse.event == 'error') {
                            throw new _error_mjs__WEBPACK_IMPORTED_MODULE_1__.APIError(undefined, data.error, data.message, undefined);
                        }
                        yield { event: sse.event, data: data };
                    }
                }
                done = true;
            }
            catch (e) {
                // If the user calls `stream.controller.abort()`, we should exit without throwing.
                if ((0,_internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__.isAbortError)(e))
                    return;
                throw e;
            }
            finally {
                // If the user `break`s, abort the ongoing request.
                if (!done)
                    controller.abort();
            }
        }
        return new Stream(iterator, controller, client);
    }
    /**
     * Generates a Stream from a newline-separated ReadableStream
     * where each item is a JSON value.
     */
    static fromReadableStream(readableStream, controller, client) {
        let consumed = false;
        async function* iterLines() {
            const lineDecoder = new _internal_decoders_line_mjs__WEBPACK_IMPORTED_MODULE_3__.LineDecoder();
            const iter = (0,_internal_shims_mjs__WEBPACK_IMPORTED_MODULE_2__.ReadableStreamToAsyncIterable)(readableStream);
            for await (const chunk of iter) {
                for (const line of lineDecoder.decode(chunk)) {
                    yield line;
                }
            }
            for (const line of lineDecoder.flush()) {
                yield line;
            }
        }
        async function* iterator() {
            if (consumed) {
                throw new _error_mjs__WEBPACK_IMPORTED_MODULE_1__.GroqError('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
            }
            consumed = true;
            let done = false;
            try {
                for await (const line of iterLines()) {
                    if (done)
                        continue;
                    if (line)
                        yield JSON.parse(line);
                }
                done = true;
            }
            catch (e) {
                // If the user calls `stream.controller.abort()`, we should exit without throwing.
                if ((0,_internal_errors_mjs__WEBPACK_IMPORTED_MODULE_4__.isAbortError)(e))
                    return;
                throw e;
            }
            finally {
                // If the user `break`s, abort the ongoing request.
                if (!done)
                    controller.abort();
            }
        }
        return new Stream(iterator, controller, client);
    }
    [(_Stream_client = new WeakMap(), Symbol.asyncIterator)]() {
        return this.iterator();
    }
    /**
     * Splits the stream into two streams which can be
     * independently read from at different speeds.
     */
    tee() {
        const left = [];
        const right = [];
        const iterator = this.iterator();
        const teeIterator = (queue) => {
            return {
                next: () => {
                    if (queue.length === 0) {
                        const result = iterator.next();
                        left.push(result);
                        right.push(result);
                    }
                    return queue.shift();
                },
            };
        };
        return [
            new Stream(() => teeIterator(left), this.controller, (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _Stream_client, "f")),
            new Stream(() => teeIterator(right), this.controller, (0,_internal_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _Stream_client, "f")),
        ];
    }
    /**
     * Converts this stream to a newline-separated ReadableStream of
     * JSON stringified values in the stream
     * which can be turned back into a Stream with `Stream.fromReadableStream()`.
     */
    toReadableStream() {
        const self = this;
        let iter;
        return (0,_internal_shims_mjs__WEBPACK_IMPORTED_MODULE_2__.makeReadableStream)({
            async start() {
                iter = self[Symbol.asyncIterator]();
            },
            async pull(ctrl) {
                try {
                    const { value, done } = await iter.next();
                    if (done)
                        return ctrl.close();
                    const bytes = (0,_internal_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_5__.encodeUTF8)(JSON.stringify(value) + '\n');
                    ctrl.enqueue(bytes);
                }
                catch (err) {
                    ctrl.error(err);
                }
            },
            async cancel() {
                await iter.return?.();
            },
        });
    }
}
async function* _iterSSEMessages(response, controller) {
    if (!response.body) {
        controller.abort();
        if (typeof globalThis.navigator !== 'undefined' &&
            globalThis.navigator.product === 'ReactNative') {
            throw new _error_mjs__WEBPACK_IMPORTED_MODULE_1__.GroqError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
        }
        throw new _error_mjs__WEBPACK_IMPORTED_MODULE_1__.GroqError(`Attempted to iterate over a response with no body`);
    }
    const sseDecoder = new SSEDecoder();
    const lineDecoder = new _internal_decoders_line_mjs__WEBPACK_IMPORTED_MODULE_3__.LineDecoder();
    const iter = (0,_internal_shims_mjs__WEBPACK_IMPORTED_MODULE_2__.ReadableStreamToAsyncIterable)(response.body);
    for await (const sseChunk of iterSSEChunks(iter)) {
        for (const line of lineDecoder.decode(sseChunk)) {
            const sse = sseDecoder.decode(line);
            if (sse)
                yield sse;
        }
    }
    for (const line of lineDecoder.flush()) {
        const sse = sseDecoder.decode(line);
        if (sse)
            yield sse;
    }
}
/**
 * Given an async iterable iterator, iterates over it and yields full
 * SSE chunks, i.e. yields when a double new-line is encountered.
 */
async function* iterSSEChunks(iterator) {
    let data = new Uint8Array();
    for await (const chunk of iterator) {
        if (chunk == null) {
            continue;
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk)
            : typeof chunk === 'string' ? (0,_internal_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_5__.encodeUTF8)(chunk)
                : chunk;
        let newData = new Uint8Array(data.length + binaryChunk.length);
        newData.set(data);
        newData.set(binaryChunk, data.length);
        data = newData;
        let patternIndex;
        while ((patternIndex = (0,_internal_decoders_line_mjs__WEBPACK_IMPORTED_MODULE_3__.findDoubleNewlineIndex)(data)) !== -1) {
            yield data.slice(0, patternIndex);
            data = data.slice(patternIndex);
        }
    }
    if (data.length > 0) {
        yield data;
    }
}
class SSEDecoder {
    constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
    }
    decode(line) {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            // empty line and we didn't previously encounter any messages
            if (!this.event && !this.data.length)
                return null;
            const sse = {
                event: this.event,
                data: this.data.join('\n'),
                raw: this.chunks,
            };
            this.event = null;
            this.data = [];
            this.chunks = [];
            return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(':')) {
            return null;
        }
        let [fieldname, _, value] = partition(line, ':');
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldname === 'event') {
            this.event = value;
        }
        else if (fieldname === 'data') {
            this.data.push(value);
        }
        return null;
    }
}
function partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
        return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, '', ''];
}
//# sourceMappingURL=streaming.mjs.map

/***/ }),
/* 41 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineDecoder: () => (/* binding */ LineDecoder),
/* harmony export */   findDoubleNewlineIndex: () => (/* binding */ findDoubleNewlineIndex)
/* harmony export */ });
/* harmony import */ var _tslib_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(42);
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex;


/**
 * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
 * reading lines from text.
 *
 * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
 */
class LineDecoder {
    constructor() {
        _LineDecoder_buffer.set(this, void 0);
        _LineDecoder_carriageReturnIndex.set(this, void 0);
        (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_buffer, new Uint8Array(), "f");
        (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    decode(chunk) {
        if (chunk == null) {
            return [];
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk)
            : typeof chunk === 'string' ? (0,_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_1__.encodeUTF8)(chunk)
                : chunk;
        (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_buffer, (0,_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_1__.concatBytes)([(0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
        const lines = [];
        let patternIndex;
        while ((patternIndex = findNewlineIndex((0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f"), (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
            if (patternIndex.carriage && (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f") == null) {
                // skip until we either get a corresponding `\n`, a new `\r` or nothing
                (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
                continue;
            }
            // we got double \r or \rtext\n
            if ((0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f") != null &&
                (patternIndex.index !== (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
                lines.push((0,_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_1__.decodeUTF8)((0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f").subarray(0, (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
                (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_buffer, (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f").subarray((0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f")), "f");
                (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_carriageReturnIndex, null, "f");
                continue;
            }
            const endIndex = (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
            const line = (0,_utils_bytes_mjs__WEBPACK_IMPORTED_MODULE_1__.decodeUTF8)((0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
            lines.push(line);
            (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_buffer, (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
            (0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldSet)(this, _LineDecoder_carriageReturnIndex, null, "f");
        }
        return lines;
    }
    flush() {
        if (!(0,_tslib_mjs__WEBPACK_IMPORTED_MODULE_0__.__classPrivateFieldGet)(this, _LineDecoder_buffer, "f").length) {
            return [];
        }
        return this.decode('\n');
    }
}
_LineDecoder_buffer = new WeakMap(), _LineDecoder_carriageReturnIndex = new WeakMap();
// prettier-ignore
LineDecoder.NEWLINE_CHARS = new Set(['\n', '\r']);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
/**
 * This function searches the buffer for the end patterns, (\r or \n)
 * and returns an object with the index preceding the matched newline and the
 * index after the newline char. `null` is returned if no new line is found.
 *
 * ```ts
 * findNewLineIndex('abc\ndef') -> { preceding: 2, index: 3 }
 * ```
 */
function findNewlineIndex(buffer, startIndex) {
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for (let i = startIndex ?? 0; i < buffer.length; i++) {
        if (buffer[i] === newline) {
            return { preceding: i, index: i + 1, carriage: false };
        }
        if (buffer[i] === carriage) {
            return { preceding: i, index: i + 1, carriage: true };
        }
    }
    return null;
}
function findDoubleNewlineIndex(buffer) {
    // This function searches the buffer for the end patterns (\r\r, \n\n, \r\n\r\n)
    // and returns the index right after the first occurrence of any pattern,
    // or -1 if none of the patterns are found.
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for (let i = 0; i < buffer.length - 1; i++) {
        if (buffer[i] === newline && buffer[i + 1] === newline) {
            // \n\n
            return i + 2;
        }
        if (buffer[i] === carriage && buffer[i + 1] === carriage) {
            // \r\r
            return i + 2;
        }
        if (buffer[i] === carriage &&
            buffer[i + 1] === newline &&
            i + 3 < buffer.length &&
            buffer[i + 2] === carriage &&
            buffer[i + 3] === newline) {
            // \r\n\r\n
            return i + 4;
        }
    }
    return -1;
}
//# sourceMappingURL=line.mjs.map

/***/ }),
/* 42 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   concatBytes: () => (/* binding */ concatBytes),
/* harmony export */   decodeUTF8: () => (/* binding */ decodeUTF8),
/* harmony export */   encodeUTF8: () => (/* binding */ encodeUTF8)
/* harmony export */ });
function concatBytes(buffers) {
    let length = 0;
    for (const buffer of buffers) {
        length += buffer.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const buffer of buffers) {
        output.set(buffer, index);
        index += buffer.length;
    }
    return output;
}
let encodeUTF8_;
function encodeUTF8(str) {
    let encoder;
    return (encodeUTF8_ ??
        ((encoder = new globalThis.TextEncoder()), (encodeUTF8_ = encoder.encode.bind(encoder))))(str);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
    let decoder;
    return (decodeUTF8_ ??
        ((decoder = new globalThis.TextDecoder()), (decodeUTF8_ = decoder.decode.bind(decoder))))(bytes);
}
//# sourceMappingURL=bytes.mjs.map

/***/ }),
/* 43 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatRequestDetails: () => (/* binding */ formatRequestDetails),
/* harmony export */   loggerFor: () => (/* binding */ loggerFor),
/* harmony export */   parseLogLevel: () => (/* binding */ parseLogLevel)
/* harmony export */ });
/* harmony import */ var _values_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

const levelNumbers = {
    off: 0,
    error: 200,
    warn: 300,
    info: 400,
    debug: 500,
};
const parseLogLevel = (maybeLevel, sourceName, client) => {
    if (!maybeLevel) {
        return undefined;
    }
    if ((0,_values_mjs__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(levelNumbers, maybeLevel)) {
        return maybeLevel;
    }
    loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
    return undefined;
};
function noop() { }
function makeLogFn(fnLevel, logger, logLevel) {
    if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
        return noop;
    }
    else {
        // Don't wrap logger functions, we want the stacktrace intact!
        return logger[fnLevel].bind(logger);
    }
}
const noopLogger = {
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
    const logger = client.logger;
    const logLevel = client.logLevel ?? 'off';
    if (!logger) {
        return noopLogger;
    }
    const cachedLogger = cachedLoggers.get(logger);
    if (cachedLogger && cachedLogger[0] === logLevel) {
        return cachedLogger[1];
    }
    const levelLogger = {
        error: makeLogFn('error', logger, logLevel),
        warn: makeLogFn('warn', logger, logLevel),
        info: makeLogFn('info', logger, logLevel),
        debug: makeLogFn('debug', logger, logLevel),
    };
    cachedLoggers.set(logger, [logLevel, levelLogger]);
    return levelLogger;
}
const formatRequestDetails = (details) => {
    if (details.options) {
        details.options = { ...details.options };
        delete details.options['headers']; // redundant + leaks internals
    }
    if (details.headers) {
        details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
            name,
            (name.toLowerCase() === 'authorization' ||
                name.toLowerCase() === 'api-key' ||
                name.toLowerCase() === 'x-api-key' ||
                name.toLowerCase() === 'cookie' ||
                name.toLowerCase() === 'set-cookie') ?
                '***'
                : value,
        ]));
    }
    if ('retryOfRequestLogID' in details) {
        if (details.retryOfRequestLogID) {
            details.retryOf = details.retryOfRequestLogID;
        }
        delete details.retryOfRequestLogID;
    }
    return details;
};
//# sourceMappingURL=log.mjs.map

/***/ }),
/* 44 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   readEnv: () => (/* binding */ readEnv)
/* harmony export */ });
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * Read an environment variable.
 *
 * Trims beginning and trailing whitespace.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */
const readEnv = (env) => {
    if (typeof globalThis.process !== 'undefined') {
        return globalThis.process.env?.[env]?.trim() || undefined;
    }
    if (typeof globalThis.Deno !== 'undefined') {
        return globalThis.Deno.env?.get?.(env)?.trim() || undefined;
    }
    return undefined;
};
//# sourceMappingURL=env.mjs.map

/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SYSTEM_LEVEL_BUGS_PROMPT: () => (/* binding */ SYSTEM_LEVEL_BUGS_PROMPT)
/* harmony export */ });
/**
 * System prompt instructing the model to find system-level bugs across
 * two phases: arithmetic/logic bugs and resource/runtime bugs.
 */
const SYSTEM_LEVEL_BUGS_PROMPT = `
You are an expert software engineer and code reviewer.
Your objective is to review the provided source code and detect SYSTEM-LEVEL BUGS.

PHASE 1 — ARITHMETIC & LOGIC BUGS:
- Division by zero
- Integer overflow / underflow
- Operator precedence errors
- Incorrect formula implementation
- Floating-point precision issues

PHASE 2 — RESOURCE & RUNTIME BUGS:
- Memory leaks
- Unclosed files / database connections / sockets
- Improper asynchronous handling / missing await
- Redundant object allocation
- Inefficient resource recomputation

The code may include multiple files or snippets.
Please analyze the code carefully and step-by-step.
Evaluate the actual code, execution path, reachable behavior, downstream effects, and exploitability in context. Do not assign a high risk merely because a bug type is known; assess the real impact, likelihood, propagation, and exploitability in this codebase.

You MUST follow this exact JSON response format:
{
  "issues": [
    {
      "type": "Division by Zero",
      "severity": "Critical",
      "file": "example.py",
      "line": 12,
      "title": "Possible division by zero",
      "explanation": "The denominator can become zero while processing untrusted input.",
      "impact": "May cause a runtime exception and fail an API request.",
      "fix": "Check the denominator before division and reject invalid input.",
      "code_fix": "if b == 0:\\n    raise ValueError(\\"b must not be zero\\")\\nreturn a / b",
      "confidence": "High",
      "riskScore": 92,
      "riskLevel": "Critical",
      "impactScore": 90,
      "likelihoodScore": 85,
      "propagationScore": 70,
      "exploitabilityScore": 75,
      "riskReason": "The zero divisor is reachable from runtime input, can crash the request path, and is easy to trigger in normal execution."
    }
  ]
}

Rules:
- "severity" must be one of: "Critical", "High", "Medium", "Low".
- "riskLevel" must be one of: "Low", "Medium", "Moderate", "High", "Critical".
- "confidence" must be one of: "High", "Medium", "Low".
- "line" must be a number (the 1-based line number in the given file).
- "riskScore" must be an integer from 1 to 100.
- "impactScore", "likelihoodScore", "propagationScore", and "exploitabilityScore" must each be integers from 1 to 100.
- Calculate final riskScore using:
  Risk Score = (Impact × 0.40) + (Likelihood × 0.30) + (Propagation × 0.20) + (Exploitability × 0.10)
  Then round to the nearest integer and clamp it between 1 and 100.
- The riskLevel must always correspond to the calculated riskScore using these thresholds:
  1-20 = Low
  21-40 = Medium
  41-60 = Moderate
  61-80 = High
  81-100 = Critical
- "riskReason" must explain why this issue is risky in context, including reachable path, effect, propagation, and exploitability.
- "code_fix" should contain a concrete corrected code snippet, not prose.
- If no issues are found, return: { "issues": [] }

Be highly precise and avoid false positives. Return valid JSON only, with no markdown code fences and no text outside the JSON object.
`;


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroqSidebarProvider: () => (/* binding */ GroqSidebarProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
class GroqSidebarProvider {
    _extensionUri;
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'jumpToCode': {
                    if (!data.file || !data.line)
                        return;
                    const uris = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.findFiles(`**/${data.file}`);
                    if (uris.length > 0) {
                        const document = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.openTextDocument(uris[0]);
                        const editor = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showTextDocument(document);
                        const position = new vscode__WEBPACK_IMPORTED_MODULE_0__.Position(Number(data.line) - 1, 0);
                        editor.selection = new vscode__WEBPACK_IMPORTED_MODULE_0__.Selection(position, position);
                        editor.revealRange(new vscode__WEBPACK_IMPORTED_MODULE_0__.Range(position, position), vscode__WEBPACK_IMPORTED_MODULE_0__.TextEditorRevealType.InCenter);
                        const decorationType = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createTextEditorDecorationType({
                            backgroundColor: 'rgba(255, 0, 0, 0.3)',
                            isWholeLine: true,
                        });
                        editor.setDecorations(decorationType, [
                            new vscode__WEBPACK_IMPORTED_MODULE_0__.Range(position, position),
                        ]);
                        setTimeout(() => {
                            editor.setDecorations(decorationType, []);
                        }, 3000);
                    }
                    else {
                        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`File ${data.file} not found in workspace.`);
                    }
                    break;
                }
                case 'analyzeWorkspace': {
                    await vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand('groq-reviewer.analyzeCode');
                    break;
                }
            }
        });
    }
    // 🔥 FIX: Safe message sending
    postMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
        else {
            console.warn('Sidebar view not initialized yet.');
        }
    }
    _getHtmlForWebview(webview) {
        const cspSource = webview.cspSource;
        const nonce = getNonce();
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body { font-family: var(--vscode-font-family); padding: 10px; }
h2 { border-bottom: 1px solid #444; padding-bottom: 5px; }

.bug-card {
  background: #1e1e1e;
  border-left: 4px solid #888;
  padding: 10px;
  margin-bottom: 10px;
}

.bug-card.sev-critical { border-left-color: #f14c4c; }
.bug-card.sev-high { border-left-color: #ff8c00; }
.bug-card.sev-medium { border-left-color: #e5c07b; }
.bug-card.sev-moderate { border-left-color: #d8a24a; }
.bug-card.sev-low { border-left-color: #6a9955; }

.bug-title { font-weight: 600; }

.bug-badge {
  display: inline-block;
  font-size: 0.75em;
  padding: 1px 6px;
  border-radius: 3px;
  background: #333;
  margin-left: 6px;
}

.bug-section-label {
  font-weight: 600;
  margin-top: 6px;
  font-size: 0.85em;
  color: #ccc;
}

.bug-meta {
  cursor: pointer;
  color: #4fc3f7;
}

button {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

.loader {
  display: none;
}
</style>
</head>

<body>
<h2>System-Level Bug Review</h2>

<button id="analyzeBtn">Analyze Workspace</button>
<div id="loader">⏳ Analyzing...</div>

<div id="results">
<p>Click Analyze to start.</p>
</div>

<script nonce="${nonce}">
const vscode = acquireVsCodeApi();

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value === undefined || value === null ? '' : String(value);
  return div.innerHTML;
}

document.getElementById('analyzeBtn').addEventListener('click', () => {
  document.getElementById('loader').style.display = 'block';
  document.getElementById('results').innerHTML = '<p>Analyzing...</p>';

  vscode.postMessage({ type: 'analyzeWorkspace' });
});

window.addEventListener('message', event => {
  const message = event.data;

  console.log("Received:", message); // 🔥 debug

  if (message.type === 'analysis_result') {
    document.getElementById('loader').style.display = 'none';

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    const issues = message.issues || [];

    if (issues.length === 0) {
      resultsDiv.innerHTML = '<p>✅ No bugs found</p>';
      return;
    }

    issues.forEach(issue => {
      const card = document.createElement('div');
      const riskLevel = (issue.riskLevel || issue.severity || '').toLowerCase();
      const sev = (issue.severity || issue.riskLevel || '').toLowerCase();
      card.className = 'bug-card' + (sev ? ' sev-' + sev : '');

      const riskScore = Number(issue.riskScore ?? 0);
      const impactScore = Number(issue.impactScore ?? 0);
      const likelihoodScore = Number(issue.likelihoodScore ?? 0);
      const propagationScore = Number(issue.propagationScore ?? 0);
      const exploitabilityScore = Number(issue.exploitabilityScore ?? 0);

      card.innerHTML = \`
        <div class="bug-title">\${escapeHtml(issue.title || issue.type || 'Issue')}
          <span class="bug-badge">\${escapeHtml(issue.severity || issue.riskLevel || '')}</span>
          <span class="bug-badge">\${escapeHtml(issue.type || '')}</span>
        </div>
        <div class="bug-meta" data-file="\${escapeHtml(issue.file)}" data-line="\${escapeHtml(issue.line)}">
          📄 \${escapeHtml(issue.file)} : Line \${escapeHtml(issue.line)}
        </div>
        <div class="bug-section-label">Risk Score</div>
        <div>Risk Score: \${escapeHtml(Number.isFinite(riskScore) ? riskScore : 0)}/100</div>
        <div>Risk Level: \${escapeHtml(issue.riskLevel || issue.severity || 'N/A')}</div>
        <div class="bug-section-label">Risk Details</div>
        <div>Impact: \${escapeHtml(Number.isFinite(impactScore) ? impactScore : 0)}/100</div>
        <div>Likelihood: \${escapeHtml(Number.isFinite(likelihoodScore) ? likelihoodScore : 0)}/100</div>
        <div>Propagation: \${escapeHtml(Number.isFinite(propagationScore) ? propagationScore : 0)}/100</div>
        <div>Exploitability: \${escapeHtml(Number.isFinite(exploitabilityScore) ? exploitabilityScore : 0)}/100</div>
        <div class="bug-section-label">Why risky</div>
        <div>\${escapeHtml(issue.riskReason || 'No risk rationale provided.')}</div>
        <div class="bug-section-label">Explanation</div>
        <div>\${escapeHtml(issue.explanation)}</div>
        <div class="bug-section-label">Impact</div>
        <div>\${escapeHtml(issue.impact)}</div>
        <div class="bug-section-label">Fix</div>
        <div>\${escapeHtml(issue.fix)}</div>
        <pre>\${escapeHtml(issue.code_fix)}</pre>
        <div class="bug-badge">Confidence: \${escapeHtml(issue.confidence || 'N/A')}</div>
      \`;

      resultsDiv.appendChild(card);
    });
  }
});

// Event delegation instead of inline onclick="" (inline event-handler
// attributes are blocked by CSP even when a script nonce is present).
document.getElementById('results').addEventListener('click', (e) => {
  const target = e.target.closest('.bug-meta');
  if (!target) return;
  vscode.postMessage({
    type: 'jumpToCode',
    file: target.dataset.file,
    line: target.dataset.line,
  });
});
</script>
</body>
</html>
`;
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activate: () => (/* binding */ activate),
/* harmony export */   deactivate: () => (/* binding */ deactivate)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _SidebarProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(46);



function activate(context) {
    console.log('Groq Intelligent Code Reviewer is now active!');
    const sidebarProvider = new _SidebarProvider__WEBPACK_IMPORTED_MODULE_2__.GroqSidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerWebviewViewProvider("groq-reviewer.sidebar", sidebarProvider));
    (0,_commands__WEBPACK_IMPORTED_MODULE_1__.registerCommands)(context, sidebarProvider);
}
function deactivate() {
    // no-op required for VS Code extension lifecycle cleanup support
    return;
}

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map