import * as vscode from 'vscode';
/**
 * Activates the PromptCompiler extension.
 *
 * Registers all commands and the sidebar webview view provider,
 * then pushes disposables into the extension context so VS Code can
 * clean them up on deactivation.
 *
 * @param context - The extension context provided by VS Code.
 */
export declare function activate(context: vscode.ExtensionContext): void;
/**
 * Deactivates the PromptCompiler extension.
 *
 * Currently a no-op; cleanup is handled by VS Code's disposable system.
 */
export declare function deactivate(): void;
//# sourceMappingURL=extension.d.ts.map