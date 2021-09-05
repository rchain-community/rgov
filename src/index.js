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
  const editorElement = unwrap(document.getElementById('editor'));

  /** @type HTMLPreElement */
  const highlightingElement = unwrap(document.getElementById('highlighting'));

  /** @type HTMLCodeElement */
  const prismElement = unwrap(document.getElementById('highlighting-content'));

  // navRouter
  /** @type HTMLElement */
  const devInterfaceDOM = unwrap(document.getElementById('devInterface'));

  /** @type HTMLElement */
  const votingDOM = unwrap(document.getElementById('votingInterface'));

  /** @type HTMLElement */
  const votingRouter = unwrap(document.getElementById('votingNav'));

  votingDOM.style.display = 'none';

  votingRouter.addEventListener('click', () => {
    devInterfaceDOM.style.display = 'none';
    votingDOM.style.display = 'block';
  });

  /** @type HTMLElement */
  const devInterfaceRouter = unwrap(document.getElementById('devInterfaceNav'));

  devInterfaceRouter.addEventListener('click', () => {
    devInterfaceDOM.style.display = 'block';
    votingDOM.style.display = 'none';
  });

  // TODO - Allow users sign in with an input form
  // Get the modal
  // const modal = document.getElementById('myModal');

  // // Get the button that opens the modal
  // const btn = document.getElementById('myBtn');

  // // Get the <span> element that closes the modal
  // const span = document.getElementsByClassName('close')[0];

  // // When the user clicks the button, open the modal
  // btn.addEventListener('click', () => {
  //   modal.style.display = 'block';
  // });

  // // When the user clicks on <span> (x), close the modal
  // span.addEventListener('click', () => {
  //   modal.style.display = 'none';
  // });

  // // When the user clicks anywhere outside of the modal, close it
  // window.addEventListener('click', () => {
  //   if (event.target === modal) {
  //     modal.style.display = 'none';
  //   }
  // });

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
