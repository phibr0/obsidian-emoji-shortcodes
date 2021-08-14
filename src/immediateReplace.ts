import { EmojiPluginSettings } from './settings';
import { Platform } from "obsidian";
import { emoji } from "./emojiList";

export default function immediateReplace(editor: CodeMirror.Editor, settings: EmojiPluginSettings) {
    if (Platform.isDesktop) {
        editor.on("cursorActivity", () => {
            if (settings.immediateReplace) {
                const lineNr = editor.getCursor().line
                const lineText = editor.getLine(lineNr);
                const match = lineText.match(/:[^ \n]*:$/gm)?.first() as (keyof typeof emoji);

                if (match && emoji[match]) {
                    editor.replaceRange(emoji[match], { line: lineNr, ch: lineText.length - match.length }, editor.getCursor());
                }
            }
        });
    }
}