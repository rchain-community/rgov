// @ts-check
import { actions } from './actions.js';
import 'https://unpkg.com/htm@3.0.4/dist/htm.js';
import 'https://unpkg.com/mithril@2.0.4/mithril.js'; // m
import {
  getEthProvider,
  MetaMaskAccount,
} from '../node_modules/rchain-api/src/ethProvider.js';
// TODO: switch to webpack for bare imports such as js-sha3
// import { getAddrFromEth } from '../node_modules/rchain-api/src/rev-address.js';
const { freeze, keys, entries } = Object;

/**
 * @param {T?} x
 * @returns {T}
 * @template T
 */
function the(x) {
  if (!x) throw new TypeError('unexpected null / undefined');
  return x;
}

/** @type {(selector: string) => HTMLElement} */
const $ = (selector) => the(document.querySelector(selector));

console.log('hi from participate.js');
console.log({ m, htm });

const html = htm.bind(m);

const state = {
  action: 'helloWorld',
  /** @type {Record<string, import('./actions').FieldSpec>} */
  fields: {},
  term: '',
};

const optionSelected = (/** @type { boolean } */ bool) =>
  bool ? { selected: 'selected' } : {};

const metaMaskP = getEthProvider({ window }).then((ethereum) =>
  MetaMaskAccount(ethereum),
);

m.mount(
  $('#actionControl'),
  freeze({
    view() {
      const options = keys(actions).map(
        (id) =>
          html`<option value=${id} ...${optionSelected(id === state.action)}>
            ${id}
          </option>`,
      );

      const fields = entries(state.fields).map(
        ([name, { value, type }]) =>
          html`<br /><label
              >${name}:
              <input
                name=${name}
                value=${value}
                onchange=${(/** @type {Event} */ event) => {
                  state.fields[name].value = event.target.value;
                }}
            /></label>
            ${type === 'walletRevAddr'
              ? html`<button
                  onclick=${(/** @type {Event} */ event) => {
                    event.preventDefault();
                    metaMaskP.then((mm) =>
                      mm.ethereumAddress().then((ethAddr) => {
                        console.log('@@@', { ethAddr });
                        // TODO:
                        // const revAddr = getAddrFromEth(ethAddr);
                        state.fields[name].value = ethAddr;
                        m.redraw();
                      }),
                    );
                  }}
                >
                  Connect Wallet
                </button>`
              : []}`,
      );

      if (keys(state.fields).length === 0) {
        state.term = actions[state.action].template;
      } else {
        state.term = `match (${entries(state.fields)
          .map(([name, { value, type }]) =>
            type === 'uri' ? `\`${value}\`` : JSON.stringify(value),
          )
          .join(', ')}) {
            (${keys(state.fields).join(', ')}) => ${
          actions[state.action].template
        }
          }`;
      }
      return html`
        <label
          >Action:
          <select
            name="action"
            onchange=${(/** @type {Event} */ event) => {
              state.action = event.target.value;
              state.fields = actions[state.action].fields || {};
            }}
          >
            ${options}
          </select>
        </label>
        ${fields}
        <br />
        <textarea cols="80" rows="16">${state.term}</textarea>
      `;
    },
  }),
);
