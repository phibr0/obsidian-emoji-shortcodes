import { Plugin } from 'obsidian';
import immediateReplace from './immediateReplace';
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
		if(this.settings.suggester) {
			return this.autosuggest?.update(cmEditor, changeObj);
		} else return false;
	  };

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new EmojiPluginSettingTab(this.app, this));

		this.autosuggest = new EmojiSuggest(this.app, this);

		this.registerMarkdownPostProcessor(EmojiMarkdownPostProcessor.emojiProcessor);
		this.registerCodeMirror(cm => immediateReplace(cm, this.settings));
		this.registerCodeMirror((cm: CodeMirror.Editor) => cm.on("change", this.autosuggestHandler));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}