
import * as vscode from 'vscode';

function getNonce(): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class GroqSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'jumpToCode': {
          if (!data.file || !data.line) return;

          const uris = await vscode.workspace.findFiles(`**/${data.file}`);
          if (uris.length > 0) {
            const document = await vscode.workspace.openTextDocument(uris[0]);
            const editor = await vscode.window.showTextDocument(document);

            const position = new vscode.Position(Number(data.line) - 1, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(
              new vscode.Range(position, position),
              vscode.TextEditorRevealType.InCenter
            );

            const decorationType =
              vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
                isWholeLine: true,
              });

            editor.setDecorations(decorationType, [
              new vscode.Range(position, position),
            ]);

            setTimeout(() => {
              editor.setDecorations(decorationType, []);
            }, 3000);
          } else {
            vscode.window.showErrorMessage(
              `File ${data.file} not found in workspace.`
            );
          }
          break;
        }

        case 'analyzeWorkspace': {
          await vscode.commands.executeCommand(
            'groq-reviewer.analyzeCode'
          );
          break;
        }
      }
    });
  }

  // 🔥 FIX: Safe message sending
  public postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    } else {
      console.warn('Sidebar view not initialized yet.');
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
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

