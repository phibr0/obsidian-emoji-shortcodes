import { Platform, Plugin, EditorSuggest, Editor, EditorPosition, TFile, EditorSuggestTriggerInfo, EditorSuggestContext } from 'obsidian';
import DefinitionListPostProcessor from './definitionListPostProcessor';
import { emoji } from './emojiList';
import EmojiMarkdownPostProcessor from './emojiPostProcessor';
import { DEFAULT_SETTINGS, EmojiPluginSettings, EmojiPluginSettingTab } from './settings';
import { checkForInputBlock } from './util';

export default class EmojiShortcodesPlugin extends Plugin {

	settings: EmojiPluginSettings;
	emojiList: string[] = Object.keys(emoji);

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new EmojiPluginSettingTab(this.app, this));
		this.registerEditorSuggest(new EmojiSuggester(this));

		this.registerMarkdownPostProcessor(EmojiMarkdownPostProcessor.emojiProcessor);
		//this.registerMarkdownPostProcessor(DefinitionListPostProcessor.definitionListProcessor);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateHistory(suggestion: string) {
		const set = new Set([suggestion, ...this.settings.history]);
		const history = [...set];
		this.emojiList = [...history, ...this.emojiList.filter(e => !set.has(e))];

		this.settings = Object.assign(this.settings, { history });
		this.saveSettings();
	}
}

class EmojiSuggester extends EditorSuggest<string> {
	plugin: EmojiShortcodesPlugin;

	constructor(plugin: EmojiShortcodesPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onTrigger(cursor: EditorPosition, editor: Editor, _: TFile): EditorSuggestTriggerInfo | null {
		if (this.plugin.settings.suggester) {
			const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
			const match = sub.match(/:\S+$/)?.first();
			if (match) {
				return {
					end: cursor,
					start: {
						ch: sub.lastIndexOf(match),
						line: cursor.line,
					},
					query: match,
				}
			}
		}
		return null;
	}

	getSuggestions(context: EditorSuggestContext): string[] {
		let emoji_query = context.query.replace(':', '').toLowerCase();
		return this.plugin.emojiList.filter(p => p.includes(emoji_query));
	}

	renderSuggestion(suggestion: string, el: HTMLElement): void {
		const outer = el.createDiv({ cls: "ES-suggester-container" });
		outer.createDiv({ cls: "ES-shortcode" }).setText(suggestion.replace(/:/g, ""));
		//@ts-expect-error
		outer.createDiv({ cls: "ES-emoji" }).setText(emoji[suggestion]);
	}

	selectSuggestion(suggestion: string): void {
		if(this.context) {
			(this.context.editor as Editor).replaceRange(this.plugin.settings.immediateReplace ? emoji[suggestion] : `${suggestion} `, this.context.start, this.context.end);
			this.plugin.updateHistory(suggestion);
		}
	}
}
