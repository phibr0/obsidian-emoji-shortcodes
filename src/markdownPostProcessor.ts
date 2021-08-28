import { MarkdownPostProcessor } from "obsidian";
import { emoji } from "./emojiList";

export default class EmojiMarkdownPostProcessor {

    static emojiProcessor: MarkdownPostProcessor = (el: HTMLElement) => {
		el.innerText.match(/[:][^\s:][^ \n:]*[:]/g)?.forEach((e: keyof typeof emoji) => EmojiMarkdownPostProcessor.emojiReplace(e, el)); 
	}

	static emojiReplace(shortcode: keyof typeof emoji, el: HTMLElement | ChildNode){
		if ((typeof(el.tagName)==="string") && (el.tagName.indexOf("CODE") !== -1 || el.tagName.indexOf("MJX") !== -1)) {
			return false;
		}
		if (el.hasChildNodes()){
			el.childNodes.forEach((child: ChildNode) => this.emojiReplace(shortcode, child));
		} else {
			el.textContent = el.textContent.replace(shortcode, emoji[shortcode] ?? shortcode);
		}
	}

}
