export function checkForInputBlock(
    cmEditor: CodeMirror.Editor,
    cursorPos: CodeMirror.Position,
  ): boolean {
    const tokenType = cmEditor.getTokenAt(cursorPos, true).type;
    return (typeof(tokenType) !== "string") || (tokenType.indexOf("code") === -1 && tokenType.indexOf("math") === -1); // "code" matches "inline-code" or "codeblock"
  }