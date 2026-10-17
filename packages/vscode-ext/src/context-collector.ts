import * as vscode from 'vscode';
import { WorkspaceContext } from 'prompt-compiler-core';

/** Maximum number of open tab paths to include in the context. */
const MAX_TAB_PATHS = 10;

/**
 * Collects workspace context from the current VS Code environment.
 *
 * Gathers information about the active editor, open tabs, and workspace
 * to provide the prompt compiler with relevant development context.
 *
 * @returns A {@link WorkspaceContext} object with all available context fields populated.
 */
export function collectWorkspaceContext(): WorkspaceContext {
  const editor = vscode.window.activeTextEditor;

  const activeFilePath = editor
    ? vscode.workspace.asRelativePath(editor.document.uri)
    : undefined;

  const activeLanguageId = editor?.document.languageId;

  const openTabPaths = vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .filter((tab): tab is vscode.Tab & { input: vscode.TabInputText } =>
      tab.input instanceof vscode.TabInputText
    )
    .slice(0, MAX_TAB_PATHS)
    .map((tab) => vscode.workspace.asRelativePath(tab.input.uri));

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.name;

  const ctx: WorkspaceContext = {};

  if (activeFilePath !== undefined) {
    ctx.activeFilePath = activeFilePath;
  }
  if (activeLanguageId !== undefined) {
    ctx.activeLanguageId = activeLanguageId;
  }
  if (openTabPaths.length > 0) {
    ctx.openTabPaths = openTabPaths;
  }
  if (workspaceRoot !== undefined) {
    ctx.workspaceRoot = workspaceRoot;
  }
  // selectedSymbols left undefined — future enhancement

  return ctx;
}
