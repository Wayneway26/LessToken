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
exports.VSCodeLMProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * LLM provider that uses the VS Code Language Model API.
 *
 * This provider leverages built-in VS Code LM capabilities (e.g., via
 * GitHub Copilot) for zero-configuration prompt compilation. No API key
 * is required — the IDE handles authentication.
 */
class VSCodeLMProvider {
    /** Unique identifier for this provider. */
    id = 'vscode-lm';
    /** Human-readable display name. */
    name = 'VS Code Language Model';
    /**
     * Generates a response using the VS Code Language Model API.
     *
     * Because the VS Code LM API does not expose a dedicated system role,
     * the system prompt and user message are concatenated into a single
     * User message.
     *
     * @param systemPrompt - The system-level instructions for the model.
     * @param userMessage  - The user-level input to compile.
     * @returns The model's response text.
     * @throws Error if no language models are available in the IDE.
     */
    async generate(systemPrompt, userMessage) {
        const models = await vscode.lm.selectChatModels({});
        if (!models || models.length === 0) {
            throw new Error('No VS Code Language Models available. Please install a model provider extension ' +
                '(e.g., GitHub Copilot) or switch to the openai-compat provider in settings.');
        }
        const model = models[0];
        const messages = [
            vscode.LanguageModelChatMessage.User(systemPrompt + '\n\n' + userMessage),
        ];
        const cancellationSource = new vscode.CancellationTokenSource();
        const response = await model.sendRequest(messages, {}, cancellationSource.token);
        let result = '';
        for await (const chunk of response.text) {
            result += chunk;
        }
        return result;
    }
}
exports.VSCodeLMProvider = VSCodeLMProvider;
//# sourceMappingURL=vscode-lm-provider.js.map