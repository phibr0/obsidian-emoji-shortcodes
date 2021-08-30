import { App } from "obsidian";
import { emoji } from "src/emojiList";
import EmojiShortcodesPlugin from "src/main";
import CodeMirrorSuggest from "./codemirror-suggest";

//This Code, including codemirror-suggest.ts and suggest.ts are modified copies of nl-dates (https://github.com/argenos/nldates-obsidian)

export default class EmojiSuggest extends CodeMirrorSuggest<string> {
  plugin: EmojiShortcodesPlugin;
  constructor(app: App, plugin: EmojiShortcodesPlugin) {
    super(app, ":");
    this.plugin = plugin;
  }

  getSuggestions(inputStr: string): string[] {
    const suggestions = this.getEmojiSuggestions(inputStr);
    if (inputStr.trim() && suggestions.length) {
      return suggestions;
    } else {
      if(inputStr === " ") {
        this.close();
        return;
      }
      return [];
    }
  }

  getEmojiSuggestions(inputStr: string): string[] {
    return Object.keys(emoji).filter((value) => value.startsWith(":" + inputStr));
  }

  renderSuggestion(suggestion: keyof typeof emoji, el: HTMLElement): void {
    const outer = el.createDiv({cls: "ES-suggester-container"});
    outer.createDiv({cls: "ES-shortcode"}).setText(this.cap(suggestion.replace(/:/g, "").replace(/_/g, " ")));
    outer.createDiv({cls: "ES-emoji"}).setText(emoji[suggestion]);
  }

  selectSuggestion(
    suggestion: keyof typeof emoji,
    _: KeyboardEvent | MouseEvent
  ): void {
    const cursorPos = this.cmEditor.getCursor();
    const line = cursorPos.line;
    const start = this.cmEditor.getLine(line).substring(0, cursorPos.ch).lastIndexOf(":");
    this.cmEditor.replaceRange(this.plugin.settings.immediateReplace ? emoji[suggestion] : suggestion, { ch: start, line: line }, cursorPos);

    this.close();
  }

  private cap(string: string): string {
    const words = string.split(" ");
  
    return words.map((word) => {
        return word[0].toUpperCase() + word.substring(1);
    }).join(" ");
  }
}
