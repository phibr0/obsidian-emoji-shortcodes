import { MarkdownPostProcessor } from "obsidian";

export default class DefinitionListPostProcessor {

    // See: https://www.markdownguide.org/extended-syntax#definition-lists for reference

    static definitionListProcessor: MarkdownPostProcessor = (el: HTMLElement) => {
        let dlists: DList[] = [];
        let i = -1;

        // See: https://regex101.com/r/zLRZpC/1
        el.innerText.match(/^.+\n(?::\s.+(?:\n|$))+/gm)?.forEach((def) => {
            let lines = def.split('\n');
            lines.forEach((line, idx) => {
                if (!line.startsWith(': ')) {
                    i++
                    dlists.push({
                        title: line,
                        defs: [],
                    });
                } else if (idx !== lines.length - 1) {
                    dlists[i].defs.push(line.substring(2));
                }
            });
        });
        if(dlists.length !== 0) {
            el.empty();
            let dl =  new HTMLDListElement();
            dlists.forEach(dlist => {
                dl.appendChild(createEl('dt', {text: dlist.title}));
                dlist.defs.forEach(def => dl.appendChild(createEl('dd', {text: def})));
            });
            el.appendChild(dl);
        }
    }
}

interface DList {
    title: string;
    defs: string[];
}