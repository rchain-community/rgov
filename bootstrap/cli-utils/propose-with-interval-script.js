#!/usr/bin/env node

/* eslint-disable */
const { propose } = require('./propose-script');

module.exports = {
    proposeWithInterval: (interval) => {
setInterval(() => {
    propose();
}, interval)
}
}

