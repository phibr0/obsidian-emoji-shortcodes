import { MarkdownPostProcessor, Plugin } from 'obsidian';
import { emoji } from "./emojis"

export default class EmojiShortcodesPlugin extends Plugin {
	emojiProcessor: MarkdownPostProcessor = (el: HTMLElement) => {
		el.innerText.match(/:[^ \n]*:/g)?.forEach((e: keyof typeof emoji) => this.emojiReplace(e, el));
	}

	emojiReplace(shortcode: keyof typeof emoji, el: HTMLElement | ChildNode){
		if (el.hasChildNodes()){
			el.childNodes.forEach((child: ChildNode) => this.emojiReplace(shortcode, child));
		} else {
			el.textContent = el.textContent.replace(shortcode, emoji[shortcode] ?? shortcode);
		}
	}

	onload() {
		this.registerMarkdownPostProcessor(this.emojiProcessor);
	}
}

