import * as vscode from 'vscode';
import {
  compile,
  TierLevel,
  LLMProvider,
  OpenAICompatProvider,
} from 'prompt-compiler-core';
import { collectWorkspaceContext } from './context-collector';
import { VSCodeLMProvider } from './vscode-lm-provider';

/**
 * Resolves the active LLM provider based on the user's extension configuration.
 *
 * @returns An {@link LLMProvider} instance matching the configured provider setting.
 * @throws Error if the openai-compat provider is selected but no API key is configured.
 */
function resolveProvider(): LLMProvider {
  const config = vscode.workspace.getConfiguration('promptCompiler');
  const providerType = config.get<string>('provider', 'vscode-lm');

  if (providerType === 'vscode-lm') {
    return new VSCodeLMProvider();
  }

  // openai-compat
  const apiKey = config.get<string>('apiKey', '');
  const apiBaseUrl = config.get<string>('apiBaseUrl', 'https://api.openai.com/v1');
  const modelName = config.get<string>('modelName', 'gpt-4o-mini');

  if (!apiKey) {
    vscode.window.showErrorMessage(
      'PromptCompiler: API key is required for the openai-compat provider. ' +
      'Set it in Settings → PromptCompiler → API Key.'
    );
    throw new Error('Missing API key for openai-compat provider.');
  }

  return new OpenAICompatProvider({
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
function getConfiguredTier(): TierLevel {
  return vscode.workspace
    .getConfiguration('promptCompiler')
    .get<TierLevel>('defaultTier', 'auto');
}

/**
 * Command: Compile & Replace Selection.
 *
 * Takes the currently selected text in the active editor, compiles it
 * through the prompt compiler, and replaces the selection with the
 * optimised English prompt.
 */
export async function compileSelectionCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showWarningMessage(
      'PromptCompiler: Please select some text to compile.'
    );
    return;
  }

  const selectedText = editor.document.getText(editor.selection);
  const workspaceContext = collectWorkspaceContext();
  const tier = getConfiguredTier();

  let provider: LLMProvider;
  try {
    provider = resolveProvider();
  } catch {
    return;
  }

  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Compiling prompt…',
        cancellable: false,
      },
      async () => compile(selectedText, provider, { tier, workspaceContext })
    );

    const success = await editor.edit((editBuilder) => {
      editBuilder.replace(editor.selection, result.compiledPrompt);
    });

    if (success) {
      vscode.window.showInformationMessage(
        `[${result.detectedTier}] ${result.tradeoffSummary}`
      );
    } else {
      vscode.window.showErrorMessage(
        'PromptCompiler: Failed to replace the selected text.'
      );
    }
  } catch (err: unknown) {
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
export async function compileFromInputBoxCommand(): Promise<void> {
  const input = await vscode.window.showInputBox({
    prompt: 'Enter Chinese prompt to compile',
    placeHolder: '输入中文提示词…',
  });

  if (!input) {
    return;
  }

  const workspaceContext = collectWorkspaceContext();
  const tier = getConfiguredTier();

  let provider: LLMProvider;
  try {
    provider = resolveProvider();
  } catch {
    return;
  }

  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Compiling prompt…',
        cancellable: false,
      },
      async () => compile(input, provider, { tier, workspaceContext })
    );

    await vscode.env.clipboard.writeText(result.compiledPrompt);

    vscode.window.showInformationMessage(
      `Compiled prompt copied to clipboard! [${result.detectedTier}] ${result.tradeoffSummary}`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`PromptCompiler: ${message}`);
  }
}
