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
exports.collectWorkspaceContext = collectWorkspaceContext;
const vscode = __importStar(require("vscode"));
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
function collectWorkspaceContext() {
    const editor = vscode.window.activeTextEditor;
    const activeFilePath = editor
        ? vscode.workspace.asRelativePath(editor.document.uri)
        : undefined;
    const activeLanguageId = editor?.document.languageId;
    const openTabPaths = vscode.window.tabGroups.all
        .flatMap((group) => group.tabs)
        .filter((tab) => tab.input instanceof vscode.TabInputText)
        .slice(0, MAX_TAB_PATHS)
        .map((tab) => vscode.workspace.asRelativePath(tab.input.uri));
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.name;
    const ctx = {};
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
//# sourceMappingURL=context-collector.js.map