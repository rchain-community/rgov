// @ts-check
import htm from 'htm';
import m from 'mithril';
import { getEthProvider, MetaMaskAccount, getAddrFromEth } from 'rchain-api';
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
    getEthProvider: () => getEthProvider({ window }),
    mount: (selector, control) => m.mount($(selector), control),
    redraw: () => m.redraw(),
  });
});

/**
 * @param { HTMLBuilder & EthSignAccess & MithrilMount } io
 * @typedef {import('./actions').FieldSpec} FieldSpec
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
function buildUI({ html, getEthProvider, mount }) {
  const state = {
    action: 'helloWorld',
    /** @type {Record<string, FieldSpec>} */
    fields: {},
    term: '',
  };

  mount('#actionControl', actionControl(state, { html, getEthProvider }));
}

/**
 * @param { Event } event
 * @returns { string }
 */
function eventValue(event) {
  const ctrl = event.target;
  if (
    !(ctrl instanceof HTMLInputElement) &&
    !(ctrl instanceof HTMLSelectElement)
  )
    throw TypeError(String(ctrl));
  return ctrl.value;
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

  function selectAction(/** @type { string } */ action) {
    state.action = action;
    state.fields = actions[state.action].fields || {};
    if (keys(state.fields).length === 0) {
      state.term = actions[state.action].template;
    } else {
      const exprs = values(state.fields).map(({ value, type }) =>
        type === 'uri' ? `\`${value}\`` : JSON.stringify(value),
      );
      state.term = `match (${exprs.join(', ')}) {
          (${keys(state.fields).join(', ')}) => ${
        actions[state.action].template
      }
  }`;
    }
  }

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
                state.fields[name].value = eventValue(event);
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
                      selectAction(state.action); // rebuild term. hm.
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
              selectAction(eventValue(event))}
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
