// @ts-check
import htm from 'htm';
import m from 'mithril';
import {
  RNode,
  RhoExpr,
  getEthProvider,
  MetaMaskAccount,
  getAddrFromEth,
} from 'rchain-api';
import { actions } from './actions.js';
const { freeze, keys, values, entries } = Object;

/**
 * @param {T?} x
 * @returns {T}
 * @template T
 */
function the(x) {
  if (!x) throw new TypeError('unexpected null / undefined');
  return x;
}

const optionSelected = (/** @type { boolean } */ bool) =>
  bool ? { selected: 'selected' } : {};

document.addEventListener('DOMContentLoaded', () => {
  /** @type {(selector: string) => HTMLElement} */
  const $ = (selector) => the(document.querySelector(selector));

  const html = htm.bind(m);

  buildUI({
    html,
    busy: makeBusy($),
    formValue: (selector) => ckControl($(selector)).value,
    fetch,
    getEthProvider: () => getEthProvider({ window }),
    mount: (selector, control) => m.mount($(selector), control),
    redraw: () => m.redraw(),
  });
});

/**
 * @typedef {{
 *   formValue: (selector: string) => string,
 *   busy: (selector: string, p: Promise<T>) => Promise<T>,
 * }} FormAccess
 * @template T
 */

/**
 * @param {(selector: string) => HTMLElement} $
 */
function makeBusy($) {
  /**
   * @param {string} selector
   * @param {Promise<T>} p
   * @return {Promise<T>}
   *
   * @template T
   */
  async function busy(selector, p) {
    $('form').style.cursor = 'wait';
    const button = $(selector);
    if (!(button instanceof HTMLButtonElement)) throw TypeError(String(button));
    button.style.cursor = 'wait';
    button.disabled = true;

    try {
      const result = await p;
      m.redraw();
      return result;
    } finally {
      button.disabled = false;
      $('form').style.cursor = 'inherit';
      button.style.cursor = 'inherit';
      m.redraw();
    }
  }
  return busy;
}

/**
 * @param { HTMLBuilder & EthSignAccess & MithrilMount & WebAccess & FormAccess<any> } io
 * @typedef {import('./actions').FieldSpec} FieldSpec
 *
 * @typedef {{
 *   fetch: typeof fetch
 * }} WebAccess
 *
 *
 * @typedef {{
 *   html: any, // TODO: htm(m) type
 * }} HTMLBuilder
 *
 * @typedef {{
 *   mount: (selector: string, component: import('mithril').Component) => void,
 *   redraw: () => void,
 * }} MithrilMount
 * @typedef {{
 *   getEthProvider: () => Promise<MetaMaskProvider>
 * }} EthSignAccess
 * @typedef { import('rchain-api/src/ethProvider').MetaMaskProvider } MetaMaskProvider
 */
function buildUI({ html, formValue, busy, getEthProvider, mount, fetch }) {
  let action = 'helloWorld';
  const rnode = RNode(fetch);
  let observer = rnode.observer(formValue('#nodeControl'));

  const state = {
    get action() {
      return action;
    },
    set action(value) {
      if (typeof value !== 'string') return;
      action = value;
      state.fields = actions[state.action].fields || {};
      const template = actions[state.action].template;
      state.term = template;
      if (keys(state.fields).length > 0) {
        const exprs = values(state.fields).map(({ value, type }) =>
          type === 'uri' ? `\`${value}\`` : JSON.stringify(value),
        );
        state.term = `match (${exprs.join(', ')}) {
            (${keys(state.fields).join(', ')}) => {${
          actions[state.action].template
        }
      }
    }`;
      }
    },
    /** @type {Record<string, FieldSpec>} */
    fields: {},
    term: '',
    get observer() {
      return observer;
    },
    result: undefined,
    problem: undefined,
  };
  state.action = action; // compute initial term

  mount('#actionControl', actionControl(state, { html, getEthProvider }));
  mount('#runControl', runControl(state, { html, formValue, busy }));
}

/**
 * @param {unknown} ctrl
 * @returns {HTMLInputElement | HTMLSelectElement}
 */
function ckControl(ctrl) {
  if (
    !(ctrl instanceof HTMLInputElement) &&
    !(ctrl instanceof HTMLSelectElement)
  )
    throw TypeError(String(ctrl));
  return ctrl;
}
/**
 * @param {{
 *   action: string,
 *   fields: Record<string, FieldSpec>,
 *   term: string,
 * }} state
 * @param {HTMLBuilder & EthSignAccess} io
 */
function actionControl(state, { html, getEthProvider }) {
  const options = (/** @type {string[]}*/ ids) =>
    ids.map(
      (id) =>
        html`<option value=${id} ...${optionSelected(id === state.action)}>
          ${id}
        </option>`,
    );

  const metaMaskP = getEthProvider().then((ethereum) =>
    MetaMaskAccount(ethereum),
  );

  const fields = (/** @type {Record<string, FieldSpec>} */ fields) =>
    entries(fields).map(
      ([name, { value, type }]) =>
        html`<br /><label
            >${name}:
            <input
              name=${name}
              value=${value}
              onchange=${(/** @type {Event} */ event) => {
                state.fields[name].value = ckControl(event.target).value;
              }}
          /></label>
          ${type === 'walletRevAddr'
            ? html`<button
                onclick=${(/** @type {Event} */ event) => {
                  event.preventDefault();
                  metaMaskP.then((mm) =>
                    mm.ethereumAddress().then((ethAddr) => {
                      console.log('@@@', { ethAddr });
                      const revAddr = getAddrFromEth(ethAddr);
                      if (!revAddr) throw new Error('bad ethAddr???');
                      state.fields[name].value = revAddr;
                      state.action = state.action; // rebuild term. hm.
                      m.redraw();
                    }),
                  );
                }}
              >
                Connect Wallet
              </button>`
            : []}`,
    );

  return freeze({
    view() {
      return html`
        <label
          >Action:
          <select
            name="action"
            onchange=${(/** @type {Event} */ event) =>
              (state.action = ckControl(event.target).value)}
          >
            ${options(keys(actions))}
          </select>
        </label>
        ${fields(state.fields)}
        <br />
        <textarea cols="80" rows="16">${state.term}</textarea>
      `;
    },
  });
}

/**
 * @param {{
 *   observer: Observer,
 *   term: string,
 *   result?: RhoExpr[],
 *   problem?: string,
 * }} state
 * @param {HTMLBuilder & FormAccess<any>} io
 *
 * @typedef {import('rchain-api').RhoExpr} RhoExpr
 * @typedef {import('rchain-api').Observer} Observer
 */
function runControl(state, { html, busy }) {
  const hide = (/** @type { boolean } */ flag) =>
    flag ? { style: 'display: none' } : {};

  const pprint = (obj) => JSON.stringify(obj, null, 2);

  async function run(/** @type {string} */ term) {
    const obs = state.observer;
    state.problem = undefined;
    state.result = undefined;
    try {
      // TODO: busy()
      const { expr, block } = await busy('#run', obs.exploratoryDeploy(term));
      state.result = expr;
      // TODO? $('#blockInfo').textContent = pprint(block);
    } catch (err) {
      state.problem = err.message;
    }
  }

  return freeze({
    view() {
      return html`<button
          id="run"
          onclick=${async (/** @type {Event} */ event) => {
            event.preventDefault();
            run(state.term);
          }}
        >
          Run
        </button>
        <section id="resultSection" ...${hide(!state.result)}>
          <h2>Result</h2>
          <pre id="result">
${state.result ? pprint(state.result.map(RhoExpr.parse)) : ''}</pre
          >
          <h2>Block Info</h2>
          <small>
            <pre id="blockInfo"></pre>
          </small>
        </section>
        <section id="problemSection" ...${hide(!state.problem)}>
          <h3>Problem</h3>
          <pre id="problem">${state.problem ? state.problem : ''}</pre>
        </section>`;
    },
  });
}
