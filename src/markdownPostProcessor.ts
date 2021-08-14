import { MarkdownPostProcessor } from "obsidian";
import { emoji } from "./emojiList";

export default class EmojiMarkdownPostProcessor {

    static emojiProcessor: MarkdownPostProcessor = (el: HTMLElement) => {
		el.innerText.match(/:[^ \n]*:/g)?.forEach((e: keyof typeof emoji) => EmojiMarkdownPostProcessor.emojiReplace(e, el)); 
	}

	static emojiReplace(shortcode: keyof typeof emoji, el: HTMLElement | ChildNode){
		if (el.hasChildNodes()){
			el.childNodes.forEach((child: ChildNode) => this.emojiReplace(shortcode, child));
		} else {
			el.textContent = el.textContent.replace(shortcode, emoji[shortcode] ?? shortcode);
		}
	}

}