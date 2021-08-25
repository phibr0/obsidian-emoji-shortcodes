import { Platform, Plugin } from 'obsidian';
import { emoji } from './emojiList';
import EmojiMarkdownPostProcessor from './markdownPostProcessor';
import { DEFAULT_SETTINGS, EmojiPluginSettings, EmojiPluginSettingTab } from './settings';
import EmojiSuggest from './suggest/emoji-suggest';

export default class EmojiShortcodesPlugin extends Plugin {

	settings: EmojiPluginSettings;
	autosuggest: EmojiSuggest;

	autosuggestHandler = (
		cmEditor: CodeMirror.Editor,
		changeObj: CodeMirror.EditorChange
	): boolean => {
		if (Platform.isDesktop && this.settings.suggester) {
			return this.autosuggest?.update(cmEditor, changeObj);
		} else {
			return false;
		}
	};

	replaceHandler = (cm: CodeMirror.Editor) => {
		if (this.settings.immediateReplace) {
			const lineNr = cm.getCursor().line
			const lineText = cm.getLine(lineNr);
			const match = lineText.match(/:[^ \n]*:$/gm)?.first() as (keyof typeof emoji);

			if (match && emoji[match]) {
				dispatchEvent(new Event("ES-replaced"));
				cm.replaceRange(emoji[match], { line: lineNr, ch: lineText.length - match.length }, cm.getCursor());
			}
		}
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new EmojiPluginSettingTab(this.app, this));

		this.autosuggest = new EmojiSuggest(this.app, this);

		this.registerMarkdownPostProcessor(EmojiMarkdownPostProcessor.emojiProcessor);
		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			if (Platform.isDesktop) {
				cm.on("cursorActivity", this.replaceHandler);
			}
			cm.on("change", this.autosuggestHandler);
		});
	}

	onunload() {
		this.app.workspace.iterateCodeMirrors((cm: CodeMirror.Editor) => {
			cm.off("change", this.autosuggestHandler);
			cm.off("cursorActivity", this.replaceHandler);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}