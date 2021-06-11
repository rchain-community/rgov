/* global window, document, fetch, setTimeout */
/* global HTMLElement */
// @ts-check

import htm from 'htm';
import m from 'mithril';
import { getEthProvider } from 'rchain-api';
import Prism from 'prismjs';
import { unwrap, buildUI, makeBusy, ckControl } from './participate';

// import 'prismjs/plugins/line-numbers/prism-line-numbers.js';

// Import rholang prism extensions
import { setRholangHighlight } from './prism-rholang.js';

setRholangHighlight(Prism);

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
  });
});
