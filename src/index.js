// Warning: ambient access
/* global window, document, fetch, setTimeout */
/* global Element, HTMLElement */
// @ts-check

import htm from 'htm';
import m from 'mithril';
import { getEthProvider } from 'rchain-api';
import Prism, { highlightElement } from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import { unwrap, buildUI, makeBusy, ckControl } from './participate';

// WARNING: ambient access
// Deal with "disappearing" newlines
Prism.hooks.add('before-sanity-check', (env) => {
  if (!(env.element instanceof HTMLElement)) return;
  env.code = env.element.innerText;
});

// WARNING: ambient access
document.addEventListener('DOMContentLoaded', () => {
  /** @type {(selector: string) => HTMLElement} */
  const $ = (selector) => unwrap(document.querySelector(selector));

  const html = htm.bind(m);

  /** @type HTMLTextAreaElement */
  const editorElement = unwrap(document.getElementById("editor"));

  /** @type HTMLPreElement */
  const highlightingElement = unwrap(document.getElementById("highlighting"));

  /** @type HTMLCodeElement */
  const prismElement = unwrap(document.getElementById("highlighting-content"));

  /** @param text: string */
  function updateHighlight(text) {
    prismElement.innerHTML = text;
    highlightElement(prismElement);
  }

  function syncScroll(element) {
    // Get and set x and y
    highlightingElement.scrollTop = editorElement.scrollTop;
    highlightingElement.scrollLeft = editorElement.scrollLeft;
  }

  editorElement.addEventListener('input', () => {
    updateHighlight(editorElement.value);
    syncScroll();
  });

  editorElement.addEventListener('scroll', () => {
    syncScroll();
  });

  buildUI({
    html,
    busy: makeBusy($, m.redraw),
    formValue: (selector) => ckControl($(selector)).value,
    fetch,
    setTimeout,
    clock: () => Promise.resolve(Date.now()),
    getEthProvider: () => getEthProvider({ window }),
    mount: (selector, control) => m.mount($(selector), control),
    hostname: document.location.hostname,
    /**
         * @param {string} language
         * @param {import('prismjs').Grammar} grammar
         */
    setGrammar: (language, grammar) => {
      Prism.languages[language] = grammar;
    },
    codeTextArea: editorElement,
    updateHighlight,
  });
});
