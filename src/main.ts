import { MarkdownPostProcessor, Plugin } from 'obsidian';
import { emoji } from "./emojis"

export default class MarkdownExtensionsPlugin extends Plugin {
	emojiProcessor: MarkdownPostProcessor = (el: HTMLElement) => {
		el.innerText.match(/:[^ \n]*:/g)?.forEach((e: keyof typeof emoji) => el.innerText = el.innerText.replace(e, emoji[e] ?? e));
	}

	async onload() {
		this.registerMarkdownPostProcessor(this.emojiProcessor);
	}
}
