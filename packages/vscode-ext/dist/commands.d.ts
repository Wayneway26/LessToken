/**
 * Command: Compile & Replace Selection.
 *
 * Takes the currently selected text in the active editor, compiles it
 * through the prompt compiler, and replaces the selection with the
 * optimised English prompt.
 */
export declare function compileSelectionCommand(): Promise<void>;
/**
 * Command: Compile from Input Box → Clipboard.
 *
 * Shows an input box for the user to type (or paste) a Chinese prompt,
 * compiles it, and copies the result to the system clipboard.
 */
export declare function compileFromInputBoxCommand(): Promise<void>;
//# sourceMappingURL=commands.d.ts.map