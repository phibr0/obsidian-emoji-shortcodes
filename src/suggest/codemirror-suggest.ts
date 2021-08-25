import { App, ISuggestOwner, Scope } from "obsidian";

import Suggest from "./suggest";

function checkForInputPhrase(
  cmEditor: CodeMirror.Editor,
  pos: CodeMirror.Position,
  phrase: string
): boolean {
  const from = {
    line: pos.line,
    ch: pos.ch - phrase.length,
  };

  if (cmEditor.getRange(from, pos) !== phrase) {
    return false;
  }

  const precedingChar = cmEditor.getRange(
    {
      line: pos.line,
      ch: from.ch - 1,
    },
    from
  );
  return !precedingChar || /[^`a-zA-Z0-9]/.test(precedingChar);
}

function isCursorBeforePos(
  pos: CodeMirror.Position,
  cursor: CodeMirror.Position
): boolean {
  if (pos.line === cursor.line) {
    return cursor.ch < pos.ch;
  }
  return cursor.line < pos.line;
}

export default abstract class CodeMirrorSuggest<T> implements ISuggestOwner<T> {
  protected app: App;
  protected cmEditor: CodeMirror.Editor;
  private scope: Scope;

  private suggestEl: HTMLElement;
  private suggest: Suggest<T>;

  private startPos: CodeMirror.Position;
  private triggerPhrase: string;

  constructor(app: App, triggerPhrase: string) {
    this.triggerPhrase = triggerPhrase;
    this.app = app;
    this.scope = new Scope();

    this.suggestEl = createDiv("suggestion-container");
    const suggestion = this.suggestEl.createDiv({ cls: "suggestion" });
    this.suggest = new Suggest(this, suggestion, this.scope);

    this.scope.register([], "Escape", this.close.bind(this));
    this.scope.register([], " ", this.close.bind(this));
    addEventListener("ES-replaced", () => {
      this.close();
    });
  }

  public update(
    cmEditor: CodeMirror.Editor,
    changeObj: CodeMirror.EditorChange
  ): boolean {
    if (this.cmEditor !== cmEditor) {
      this.suggestEl?.detach();
    }
    this.cmEditor = cmEditor;
    const cursorPos = cmEditor.getCursor();

    // autosuggest is open
    if (this.suggestEl.parentNode) {
      if (isCursorBeforePos(this.startPos, cursorPos) || cmEditor.getLine(cursorPos.line).substring(0, cursorPos.ch).endsWith("::")) {
        this.close();
        return false;
      }
      this.attachAtCursor();
    } else {
      if (
        changeObj.text.length === 1 && // ignore multi-cursors
        checkForInputPhrase(this.cmEditor, cursorPos, this.triggerPhrase) &&
        !document.querySelector(".suggestion-container") // don't trigger multiple autosuggests
      ) {
        this.startPos = cursorPos;
        this.open();
        this.attachAtCursor();
      }
    }

    return false;
  }

  protected getStartPos(): CodeMirror.Position {
    return {
      line: this.startPos.line,
      ch: this.startPos.ch - this.triggerPhrase.length,
    };
  }

  protected getInputStr(): string {
    // return string from / to cursor
    const cursor = this.cmEditor.getCursor();
    const line = this.cmEditor.getLine(cursor.line);
    return line.substring(this.startPos.ch, cursor.ch);
  }

  private attachAtCursor() {
    const inputStr = this.getInputStr();
    const suggestions = this.getSuggestions(inputStr);
    this.suggest.setSuggestions(suggestions);

    this.cmEditor.addWidget(this.cmEditor.getCursor(), this.suggestEl, true);
  }

  open(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>this.app).keymap.pushScope(this.scope);
  }

  close(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>this.app).keymap.popScope(this.scope);
    this.startPos = null;
    this.suggest.setSuggestions([]);
    this.suggestEl.detach();
  }

  abstract getSuggestions(inputStr: string): T[];
  abstract renderSuggestion(item: T, el: HTMLElement): void;
  abstract selectSuggestion(item: T, evt: MouseEvent | KeyboardEvent): void;
}