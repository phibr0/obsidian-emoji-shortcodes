import { Plugin } from 'obsidian';
import emojiPopover from './emojiPopover';
import immediateReplace from './immediateReplace';
import EmojiMarkdownPostProcessor from './markdownPostProcessor';
import { DEFAULT_SETTINGS, EmojiPluginSettings, EmojiPluginSettingTab } from './settings';

export default class EmojiShortcodesPlugin extends Plugin {

	settings: EmojiPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new EmojiPluginSettingTab(this.app, this));

		this.registerMarkdownPostProcessor(EmojiMarkdownPostProcessor.emojiProcessor);
		this.registerCodeMirror(cm => immediateReplace(cm, this.settings));
		this.registerCodeMirror(cm => emojiPopover(cm));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}