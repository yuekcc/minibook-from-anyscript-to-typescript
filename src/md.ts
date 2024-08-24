import { marked, parseInline } from 'marked';
import DomPurify from 'dompurify';
import { makeId } from './util';
import type { Heading } from './types';

marked.use({
  renderer: {
    paragraph({ text }) {
      if (text === '[TOC]') {
        return `<p id="toc" class="toc"></p>`;
      }

      return `<p>${parseInline(text)}</p>`;
    },
    heading({ text, depth }) {
      const tag = `h${depth}`;
      return `<${tag} id="${makeId(text)}">${text}</${tag}>`;
    },
  },
});

let headings: Heading[] = [];

marked.use({
  walkTokens: token => {
    if (token.type === 'heading' && (token.depth === 2 || token.depth === 3)) {
      headings.push({
        level: token.depth,
        depth: token.depth,
        text: token.text,
        id: makeId(token.text),
        children: [],
      });
    }
  },
});

export async function renderMarkdown(text: string) {
  const rendered = await marked.parse(text);
  const result = {
    headings,
    html: DomPurify.sanitize(rendered),
  };

  headings = [];

  return result;
}
