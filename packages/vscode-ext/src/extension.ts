import * as vscode from 'vscode';
import { compileSelectionCommand, compileFromInputBoxCommand } from './commands';
import { CompilerPanelProvider } from './webview/panel';

/**
 * Activates the PromptCompiler extension.
 *
 * Registers all commands and the sidebar webview view provider,
 * then pushes disposables into the extension context so VS Code can
 * clean them up on deactivation.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  const compileSelectionDisposable = vscode.commands.registerCommand(
    'promptCompiler.compileSelection',
    compileSelectionCommand
  );

  const compileInputBoxDisposable = vscode.commands.registerCommand(
    'promptCompiler.compileFromInputBox',
    compileFromInputBoxCommand
  );

  const openPanelDisposable = vscode.commands.registerCommand(
    'promptCompiler.openPanel',
    () => vscode.commands.executeCommand('promptCompiler.panel.focus')
  );

  const panelProvider = new CompilerPanelProvider();
  const panelDisposable = vscode.window.registerWebviewViewProvider(
    CompilerPanelProvider.viewType,
    panelProvider
  );

  context.subscriptions.push(
    compileSelectionDisposable,
    compileInputBoxDisposable,
    openPanelDisposable,
    panelDisposable
  );

  console.log('PromptCompiler activated');
}

/**
 * Deactivates the PromptCompiler extension.
 *
 * Currently a no-op; cleanup is handled by VS Code's disposable system.
 */
export function deactivate(): void {
  // intentionally empty
}
