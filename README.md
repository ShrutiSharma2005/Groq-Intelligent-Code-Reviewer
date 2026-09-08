# 🚀 Groq Intelligent Code Reviewer

An AI-powered Visual Studio Code extension that performs **workspace-wide static code analysis** using the **Groq LLM API** to detect complex bugs across multiple files. Instead of reviewing files in isolation, the extension builds contextual understanding of your project and identifies system-level issues with precise explanations and actionable fix suggestions.

> Powered exclusively by **Groq's `llama-3.3-70b-versatile`** model for fast, high-quality reasoning.

---

## ✨ Features

### 🧠 Workspace-Aware Analysis

- Analyzes the entire project instead of individual files.
- Understands relationships between modules, functions, and dependencies.
- Detects bugs that span multiple files.

### ⚡ AI-Powered Code Review

- Uses **Groq's API** model exclusively.
- No model switching or fallbacks.
- Generates intelligent explanations with practical fix recommendations.

### 🔍 Phase 1 — Arithmetic & Logic Analysis

Detects common computational mistakes, including:

- Division by zero
- Integer overflow and underflow
- Incorrect operator precedence
- Formula implementation errors
- Precision loss
- Faulty mathematical expressions

### 🛠️ Phase 2 — Resource & Runtime Analysis

Identifies resource-management and runtime issues such as:

- Memory leaks
- Unclosed files
- Database connection leaks
- Socket leaks
- Missing `await` in asynchronous code
- Improper async handling
- Redundant object creation
- Inefficient resource recomputation

### 📋 Interactive VS Code Sidebar

- View detected issues in a clean sidebar.
- Read AI-generated explanations.
- Review suggested fixes.
- Jump directly to the affected source code with a single click.

---

# 📦 Prerequisites

Before running the extension, ensure you have:

- **Node.js** installed
- **Visual Studio Code 1.80.0** or later
- A **Groq API Key**

Get one for free at:

https://console.groq.com/

---

# ⚙️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile the Extension

```bash
npm run compile
```

### 3. Configure Your Groq API Key

1. Open **Visual Studio Code**
2. Go to **Settings** (`Ctrl/Cmd + ,`)
3. Search for **Groq Reviewer**
4. Paste your API key into:

```text
groq-reviewer.apiKey
```

---

# ▶️ Running the Extension

Press **F5** inside the project, or use **Run → Start Debugging**.

This launches a new **Extension Development Host** window with the extension enabled.

---

# 📖 Usage

## Using the Command Palette

1. Open the **sample-tests** folder in the Extension Development Host.
2. Press:

```text
Ctrl/Cmd + Shift + P
```

3. Run:

```text
Groq: Analyze Code
```

---

## Using the Sidebar

1. Click the **Groq Reviewer** icon in the Activity Bar.
2. Select **Analyze Workspace**.
3. Wait for the analysis to complete.
4. Browse detected issues in the sidebar.
5. Click any issue to navigate directly to the relevant code.

---

# 🧩 Analysis Workflow

```text
Workspace
     │
     ▼
Read Project Files
     │
     ▼
Build Cross-File Context
     │
     ▼
Send Context to Groq
(llama-3.3-70b-versatile)
     │
     ▼
AI Bug Detection
     │
     ▼
Fix Suggestions
     │
     ▼
Interactive Sidebar
```

---

# 🎯 Current Detection Capabilities

| Category | Checks |
|----------|--------|
| Arithmetic | Division by zero, overflow, underflow, precision loss |
| Logic | Formula errors, operator precedence, incorrect computations |
| Runtime | Missing `await`, async misuse |
| Resources | Memory leaks, unclosed files, sockets, database connections |
| Performance | Redundant allocations, repeated expensive computations |

---

# 🔮 Roadmap

Planned future enhancements include:

- Concurrency and race-condition detection
- Security vulnerability analysis
- One-click AI-generated code fixes
- Configurable analysis rules
- Incremental analysis for large projects
- Support for additional programming languages
- Inline diagnostics and Quick Fix actions
- CI/CD integration

---

# 🛠️ Tech Stack

- **TypeScript**
- **Visual Studio Code Extension API**
- **Groq API**
- **Llama 3.3 70B Versatile**

---

# 🤝 Contributing

Contributions, feature requests, and bug reports are welcome. Feel free to open an issue or submit a pull request to help improve the project.

---

# 📄 License

This project is licensed under the **MIT License**.
