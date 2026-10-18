import * as vscode from 'vscode';
/**
 * Webview view provider for the PromptCompiler sidebar panel.
 *
 * Renders a self-contained HTML UI with a textarea for Chinese input,
 * a tier selector, compile / copy buttons, and an output area.
 * Communication with the extension host happens via `postMessage`.
 */
export declare class CompilerPanelProvider implements vscode.WebviewViewProvider {
    /** The identifier used when registering this provider. */
    static readonly viewType = "promptCompiler.panel";
    private _view?;
    /**
     * Called by VS Code when the webview view becomes visible.
     *
     * Sets up the HTML content and the bi-directional message channel
     * between the webview and the extension host.
     */
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    /**
     * Handles a compile request from the webview.
     *
     * @param text - The Chinese prompt text to compile.
     * @param tier - The selected complexity tier.
     */
    private _handleCompile;
    /**
     * Handles a copy request from the webview by writing text to the clipboard.
     *
     * @param text - The text to copy.
     */
    private _handleCopy;
}
//# sourceMappingURL=panel.d.ts.map