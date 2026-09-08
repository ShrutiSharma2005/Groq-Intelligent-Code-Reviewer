import Groq from "groq-sdk";
import * as vscode from "vscode";

let groq: Groq | null = null;

export type RiskLevel = "Low" | "Medium" | "Moderate" | "High" | "Critical";
export type ReviewConfidence = "High" | "Medium" | "Low";

export interface ReviewIssue {
  type: string;
  severity?: "Critical" | "High" | "Medium" | "Low";
  file: string;
  line: number;
  title: string;
  explanation: string;
  impact: string;
  fix: string;
  code_fix: string;
  confidence: ReviewConfidence;
  riskScore: number;
  riskLevel: RiskLevel;
  impactScore: number;
  likelihoodScore: number;
  propagationScore: number;
  exploitabilityScore: number;
  riskReason: string;
}

/**
 * The ONLY model this extension is allowed to call.
 * Do not make this configurable and do not add fallbacks — if a request to
 * this model fails, the Groq error must be surfaced to the user as-is.
 */
export const GROQ_MODEL = "openai/gpt-oss-120b" as const;

/**
 * Initializes the Groq client with the API key from VS Code settings.
 */
const HARDCODED_API_KEY = ""; // Replace with your actual API key or leave as is to force users to set it in settings

function clampScore(value: number, min = 1, max = 100): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

export function getRiskLevelForScore(score: number): RiskLevel {
  if (score <= 20) return "Low";
  if (score <= 40) return "Medium";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}

export function computeRiskScore(
  impact: number,
  likelihood: number,
  propagation: number,
  exploitability: number
): number {
  const weighted =
    impact * 0.4 +
    likelihood * 0.3 +
    propagation * 0.2 +
    exploitability * 0.1;

  return clampScore(weighted);
}

export function sanitizeReviewIssue(rawIssue: any): ReviewIssue | null {
  if (!rawIssue || typeof rawIssue !== "object") {
    return null;
  }

  const impactScore = clampScore(Number(rawIssue.impactScore ?? 1));
  const likelihoodScore = clampScore(Number(rawIssue.likelihoodScore ?? 1));
  const propagationScore = clampScore(Number(rawIssue.propagationScore ?? 1));
  const exploitabilityScore = clampScore(Number(rawIssue.exploitabilityScore ?? 1));
  const riskScore = clampScore(
    computeRiskScore(
      impactScore,
      likelihoodScore,
      propagationScore,
      exploitabilityScore
    )
  );

  const riskLevel = getRiskLevelForScore(riskScore);
  const confidence =
    rawIssue.confidence === "High" || rawIssue.confidence === "Medium" || rawIssue.confidence === "Low"
      ? rawIssue.confidence
      : "Medium";

  const severity =
    rawIssue.severity === "Critical" ||
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
    riskReason: String(
      rawIssue.riskReason ??
        "Risk is based on the code's reachable impact, likelihood, propagation, and exploitability in context."
    ),
  };
}

export function sanitizeReviewResults(result: any): ReviewIssue[] {
  const issues = Array.isArray(result?.issues) ? result.issues : [];
  return issues
    .map((issue: any) => sanitizeReviewIssue(issue))
    .filter((issue: ReviewIssue | null): issue is ReviewIssue => issue !== null);
}

export function initGroqClient(): void {
  const config = vscode.workspace.getConfiguration("groq-reviewer");
  // Use the key from VS Code settings, or fall back to the hardcoded key
  const apiKey = config.get<string>("apiKey") || HARDCODED_API_KEY;

  if (!apiKey) {
    vscode.window.showErrorMessage(
      "Groq API Key is not set. Please configure 'groq-reviewer.apiKey' in your settings."
    );
    return;
  }

  groq = new Groq({ apiKey });
}

export async function getGroqClient(): Promise<Groq> {
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
export async function checkModelAvailability(): Promise<{
  ok: boolean;
  modelIds: string[];
  targetAvailable: boolean;
  error?: string;
}> {
  try {
    const client = await getGroqClient();
    const response = await client.models.list();
    // response.data is the array of { id, ... } model objects.
    const modelIds = (response?.data ?? [])
      .map((m: any) => m?.id)
      .filter((id: any): id is string => typeof id === "string")
      .sort();

    return {
      ok: true,
      modelIds,
      targetAvailable: modelIds.includes(GROQ_MODEL),
    };
  } catch (error: any) {
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
export async function runModelAvailabilityDiagnostic(): Promise<void> {
  const output = vscode.window.createOutputChannel("Groq Reviewer Diagnostics");
  output.show(true);
  output.appendLine(`Checking model access for: ${GROQ_MODEL}`);
  output.appendLine("(API key is never printed.)");
  output.appendLine("");

  const result = await checkModelAvailability();

  if (!result.ok) {
    output.appendLine(`FAILED to reach Groq's model list endpoint.`);
    output.appendLine(`Error: ${result.error}`);
    vscode.window.showErrorMessage(
      "Could not verify Groq model access — see 'Groq Reviewer Diagnostics' output."
    );
    return;
  }

  output.appendLine(`Models visible to this API key (${result.modelIds.length}):`);
  for (const id of result.modelIds) {
    output.appendLine(`  - ${id}`);
  }
  output.appendLine("");

  if (result.targetAvailable) {
    output.appendLine(`✅ ${GROQ_MODEL} IS in this key's model list.`);
    output.appendLine(
      "If chat completions still 404 for this model, the problem is in the request itself, not access."
    );
    vscode.window.showInformationMessage(
      `${GROQ_MODEL} is available to your Groq API key.`
    );
  } else {
    output.appendLine(`❌ ${GROQ_MODEL} is NOT in this key's model list.`);
    output.appendLine(
      "This means your Groq account/key does not currently have access to this model " +
      "(it may be deprecated or restricted on your plan). No fallback model was used."
    );
    vscode.window.showWarningMessage(
      `${GROQ_MODEL} is not available to your Groq API key. See 'Groq Reviewer Diagnostics' output.`
    );
  }
}

/**
 * Sends a prompt to the Groq API and expects a JSON response.
 */
export async function analyzeWithGroq(
  systemPrompt: string,
  userContent: string
): Promise<any> {
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
  } catch (error: any) {
    // Do NOT fall back to another model or provider. Surface the exact
    // Groq error to the user so they can see what actually failed.
    const message = error?.message || String(error);
    vscode.window.showErrorMessage(
      `Groq API Error (model: ${GROQ_MODEL}): ${message}`
    );
    throw error;
  }
}
