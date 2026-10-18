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
exports.compileSelectionCommand = compileSelectionCommand;
exports.compileFromInputBoxCommand = compileFromInputBoxCommand;
const vscode = __importStar(require("vscode"));
const prompt_compiler_core_1 = require("prompt-compiler-core");
const context_collector_1 = require("./context-collector");
const vscode_lm_provider_1 = require("./vscode-lm-provider");
/**
 * Resolves the active LLM provider based on the user's extension configuration.
 *
 * @returns An {@link LLMProvider} instance matching the configured provider setting.
 * @throws Error if the openai-compat provider is selected but no API key is configured.
 */
function resolveProvider() {
    const config = vscode.workspace.getConfiguration('promptCompiler');
    const providerType = config.get('provider', 'vscode-lm');
    if (providerType === 'vscode-lm') {
        return new vscode_lm_provider_1.VSCodeLMProvider();
    }
    // openai-compat
    const apiKey = config.get('apiKey', '');
    const apiBaseUrl = config.get('apiBaseUrl', 'https://api.openai.com/v1');
    const modelName = config.get('modelName', 'gpt-4o-mini');
    if (!apiKey) {
        vscode.window.showErrorMessage('PromptCompiler: API key is required for the openai-compat provider. ' +
            'Set it in Settings → PromptCompiler → API Key.');
        throw new Error('Missing API key for openai-compat provider.');
    }
    return new prompt_compiler_core_1.OpenAICompatProvider({
        apiKey,
        baseUrl: apiBaseUrl,
        model: modelName,
    });
}
/**
 * Reads the default complexity tier from extension configuration.
 *
 * @returns The configured {@link TierLevel}, defaulting to `'auto'`.
 */
function getConfiguredTier() {
    return vscode.workspace
        .getConfiguration('promptCompiler')
        .get('defaultTier', 'auto');
}
/**
 * Command: Compile & Replace Selection.
 *
 * Takes the currently selected text in the active editor, compiles it
 * through the prompt compiler, and replaces the selection with the
 * optimised English prompt.
 */
async function compileSelectionCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage('PromptCompiler: Please select some text to compile.');
        return;
    }
    const selectedText = editor.document.getText(editor.selection);
    const workspaceContext = (0, context_collector_1.collectWorkspaceContext)();
    const tier = getConfiguredTier();
    let provider;
    try {
        provider = resolveProvider();
    }
    catch {
        return;
    }
    try {
        const result = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Compiling prompt…',
            cancellable: false,
        }, async () => (0, prompt_compiler_core_1.compile)(selectedText, provider, { tier, workspaceContext }));
        const success = await editor.edit((editBuilder) => {
            editBuilder.replace(editor.selection, result.compiledPrompt);
        });
        if (success) {
            vscode.window.showInformationMessage(`[${result.detectedTier}] ${result.tradeoffSummary}`);
        }
        else {
            vscode.window.showErrorMessage('PromptCompiler: Failed to replace the selected text.');
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`PromptCompiler: ${message}`);
    }
}
/**
 * Command: Compile from Input Box → Clipboard.
 *
 * Shows an input box for the user to type (or paste) a Chinese prompt,
 * compiles it, and copies the result to the system clipboard.
 */
async function compileFromInputBoxCommand() {
    const input = await vscode.window.showInputBox({
        prompt: 'Enter Chinese prompt to compile',
        placeHolder: '输入中文提示词…',
    });
    if (!input) {
        return;
    }
    const workspaceContext = (0, context_collector_1.collectWorkspaceContext)();
    const tier = getConfiguredTier();
    let provider;
    try {
        provider = resolveProvider();
    }
    catch {
        return;
    }
    try {
        const result = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Compiling prompt…',
            cancellable: false,
        }, async () => (0, prompt_compiler_core_1.compile)(input, provider, { tier, workspaceContext }));
        await vscode.env.clipboard.writeText(result.compiledPrompt);
        vscode.window.showInformationMessage(`Compiled prompt copied to clipboard! [${result.detectedTier}] ${result.tradeoffSummary}`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`PromptCompiler: ${message}`);
    }
}
//# sourceMappingURL=commands.js.map