/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* global window, document, fetch, setTimeout */
/* global HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement, HTMLButtonElement */
// @ts-check
import htm from 'htm';
import m from 'mithril';
import {
   RNode,
   RhoExpr,
   getEthProvider,
   MetaMaskAccount,
   getAddrFromEth,
   signMetaMask,
   startTerm,
   listenAtDeployId,
} from 'rchain-api';
import { maxFee, NETWORKS } from './participate.js';

const { freeze, keys, entries, fromEntries } = Object;
