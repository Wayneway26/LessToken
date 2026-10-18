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
exports.CompilerPanelProvider = void 0;
const vscode = __importStar(require("vscode"));
const prompt_compiler_core_1 = require("prompt-compiler-core");
const context_collector_1 = require("../context-collector");
const vscode_lm_provider_1 = require("../vscode-lm-provider");
/**
 * Webview view provider for the PromptCompiler sidebar panel.
 *
 * Renders a self-contained HTML UI with a textarea for Chinese input,
 * a tier selector, compile / copy buttons, and an output area.
 * Communication with the extension host happens via `postMessage`.
 */
class CompilerPanelProvider {
    /** The identifier used when registering this provider. */
    static viewType = 'promptCompiler.panel';
    _view;
    /**
     * Called by VS Code when the webview view becomes visible.
     *
     * Sets up the HTML content and the bi-directional message channel
     * between the webview and the extension host.
     */
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = getWebviewContent();
        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === 'compile') {
                await this._handleCompile(msg.text, msg.tier);
            }
            else if (msg.type === 'copy') {
                await this._handleCopy(msg.text);
            }
        });
    }
    /**
     * Handles a compile request from the webview.
     *
     * @param text - The Chinese prompt text to compile.
     * @param tier - The selected complexity tier.
     */
    async _handleCompile(text, tier) {
        if (!this._view) {
            return;
        }
        try {
            const provider = resolveProvider();
            const workspaceContext = (0, context_collector_1.collectWorkspaceContext)();
            const result = await (0, prompt_compiler_core_1.compile)(text, provider, { tier, workspaceContext });
            await this._view.webview.postMessage({
                type: 'result',
                data: result,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`PromptCompiler: ${message}`);
            await this._view.webview.postMessage({
                type: 'error',
                message,
            });
        }
    }
    /**
     * Handles a copy request from the webview by writing text to the clipboard.
     *
     * @param text - The text to copy.
     */
    async _handleCopy(text) {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Compiled prompt copied to clipboard!');
    }
}
exports.CompilerPanelProvider = CompilerPanelProvider;
/**
 * Resolves the active LLM provider based on extension configuration.
 * Mirrors the logic in commands.ts for consistency.
 */
function resolveProvider() {
    const config = vscode.workspace.getConfiguration('promptCompiler');
    const providerType = config.get('provider', 'vscode-lm');
    if (providerType === 'vscode-lm') {
        return new vscode_lm_provider_1.VSCodeLMProvider();
    }
    const apiKey = config.get('apiKey', '');
    const apiBaseUrl = config.get('apiBaseUrl', 'https://api.openai.com/v1');
    const modelName = config.get('modelName', 'gpt-4o-mini');
    if (!apiKey) {
        throw new Error('API key is required for the openai-compat provider. ' +
            'Set it in Settings → PromptCompiler → API Key.');
    }
    return new prompt_compiler_core_1.OpenAICompatProvider({
        apiKey,
        baseUrl: apiBaseUrl,
        model: modelName,
    });
}
/**
 * Returns the full HTML string for the webview panel.
 *
 * Self-contained with inline CSS and JS, styled to look native in VS Code's
 * dark theme via CSS custom properties.
 */
function getWebviewContent() {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PromptCompiler</title>
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family, system-ui, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background, transparent);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    label {
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
    }

    select,
    textarea,
    button {
      font-family: inherit;
      font-size: inherit;
      border-radius: 4px;
      outline: none;
    }

    select,
    textarea {
      width: 100%;
      padding: 6px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, transparent);
    }

    select:focus,
    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .btn-row {
      display: flex;
      gap: 6px;
    }

    button {
      flex: 1;
      padding: 6px 12px;
      cursor: pointer;
      border: none;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-weight: 600;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .output {
      width: 100%;
      min-height: 80px;
      padding: 8px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 4px;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 12px);
      overflow-y: auto;
      max-height: 300px;
    }

    .status {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
      min-height: 1.4em;
    }
  </style>
</head>
<body>
  <label for="tier">Complexity Tier</label>
  <select id="tier">
    <option value="auto" selected>Auto</option>
    <option value="light">Light</option>
    <option value="standard">Standard</option>
    <option value="heavy">Heavy</option>
  </select>

  <label for="input">Chinese Prompt</label>
  <textarea id="input" placeholder="输入中文提示词…"></textarea>

  <div class="btn-row">
    <button id="compileBtn">Compile</button>
    <button id="copyBtn" class="secondary" disabled>Copy</button>
  </div>

  <label>Compiled Output</label>
  <div class="output" id="output"></div>

  <div class="status" id="status"></div>

  <script>
    (function () {
      // @ts-ignore — provided by VS Code webview runtime
      const vscodeApi = acquireVsCodeApi();

      const tierEl = document.getElementById('tier');
      const inputEl = document.getElementById('input');
      const outputEl = document.getElementById('output');
      const statusEl = document.getElementById('status');
      const compileBtn = document.getElementById('compileBtn');
      const copyBtn = document.getElementById('copyBtn');

      let lastCompiledText = '';

      compileBtn.addEventListener('click', () => {
        const text = inputEl.value.trim();
        if (!text) {
          return;
        }

        compileBtn.disabled = true;
        compileBtn.textContent = 'Compiling…';
        outputEl.textContent = '';
        statusEl.textContent = '';
        copyBtn.disabled = true;
        lastCompiledText = '';

        vscodeApi.postMessage({
          type: 'compile',
          text: text,
          tier: tierEl.value,
        });
      });

      copyBtn.addEventListener('click', () => {
        if (!lastCompiledText) {
          return;
        }
        vscodeApi.postMessage({
          type: 'copy',
          text: lastCompiledText,
        });
      });

      window.addEventListener('message', (event) => {
        const msg = event.data;

        if (msg.type === 'result') {
          const data = msg.data;
          lastCompiledText = data.compiledPrompt || '';
          outputEl.textContent = lastCompiledText;
          statusEl.textContent =
            '[' + (data.detectedTier || '?') + '] ' + (data.tradeoffSummary || '');
          copyBtn.disabled = !lastCompiledText;
        } else if (msg.type === 'error') {
          outputEl.textContent = '';
          statusEl.textContent = 'Error: ' + (msg.message || 'Unknown error');
          copyBtn.disabled = true;
        }

        compileBtn.disabled = false;
        compileBtn.textContent = 'Compile';
      });
    })();
  </script>
</body>
</html>`;
}
//# sourceMappingURL=panel.js.map