import { PluginSettingTab, App, Setting } from "obsidian";
import EmojiShortcodesPlugin from "./main";

export interface EmojiPluginSettings{
    immediateReplace: boolean;
}

export const DEFAULT_SETTINGS: EmojiPluginSettings = {
    immediateReplace: true,
}

export class EmojiPluginSettingTab extends PluginSettingTab {
	plugin: EmojiShortcodesPlugin;

	constructor(app: App, plugin: EmojiShortcodesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Emoji Shortcodes Plugin'});

		new Setting(containerEl)
			.setName('Immediate Emoji Replace')
			.setDesc('If this is turned on, Emoji shortcodes will be immediately replaced after typing. Otherwise they are still stored as a shortcode and you only see the Emoji in Preview Mode.')
			.addToggle(cb => {
                cb.setValue(this.plugin.settings.immediateReplace)
                .onChange(async value => {
                    this.plugin.settings.immediateReplace = value;
                    await this.plugin.saveSettings();
                })
            })
	}
}