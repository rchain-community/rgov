// WARNING: ambient access
/* global window, document, fetch, setTimeout */
/* global Element, HTMLElement */
// @ts-check

import htm from 'htm';
import m from 'mithril';
import { getEthProvider } from 'rchain-api';
import Prism, { highlightElement } from 'prismjs';
import { unwrap, buildUI, makeBusy, ckControl } from './participate';

// import 'prismjs/plugins/line-numbers/prism-line-numbers.js';

// Deal with "disappearing" newlines
Prism.hooks.add('before-sanity-check', (env) => {
  if (!(env.element instanceof HTMLElement)) return;
  env.code = env.element.innerText;
});

/**
 * Update textContent; run highlighting hooks.
 *
 * ISSUE: should this module know the selector?
 *        or should it be passed in?
 *
 * @param {string} text
 */
function updateHighlighting(text) {
  const resultElement = document.querySelector('#highlighting-content');
  if (!(resultElement instanceof HTMLElement)) return;
  resultElement.innerText = text;
  highlightElement(resultElement);
}

/**
 * @param {Event} event
 */
function syncScroll(event) {
  const element = event.target;
  if (!(element instanceof Element)) return;
  /* Scroll result to scroll coords of event - sync with textarea */
  const resultElement = document.querySelector('#highlighting');
  if (resultElement === null) return;
  // Get and set x and y
  resultElement.scrollTop = element.scrollTop;
  resultElement.scrollLeft = element.scrollLeft;
}

document.addEventListener('DOMContentLoaded', () => {
  /** @type {(selector: string) => HTMLElement} */
  const $ = (selector) => unwrap(document.querySelector(selector));

  const html = htm.bind(m);

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
    updateHighlighting,
    syncScroll,
  });
});
