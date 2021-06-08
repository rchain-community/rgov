// following the instructions laid out in
// https://prismjs.com/extending.html#language-definitions

import Prism from 'prismjs';

export function setRholangHighlight(Prism) {
   Prism.languages.rholang = {
      'comment': {
         pattern: /\/\/.*/,
         inside: { 'italic': /(TODO|FIXME|XXX|NOTE).*/i, }
      },
      'string': /"[^"]*"/,
      'url': [
         /`[4-9][0-9]|[0-3][0-9][0-9]`/,
         /`rho:[^:]+:.*`/
      ],
      'keyword': /(contract|for|in|if|else|match|new|select|case|bundle|bundle0|bundle+|bundle-)/,
      'operator': [
         /!|<-|<<-|<=|=>|_|\.\.\./,
         /\+|-|\*\|\/[^\/]|(==)|=/,
         /\w(not|and|or)\w/,
      ],
      'punctuation': /\(|\[|\{|\}|\]|\)|:/,

      'number': [
         /0[b][0-1]+/i, // binary integer
         /0[0-7]*/, // octal integer (including literal zero!)
         /0x([0-9a-f])+/i, // hexadecimal integer
         /[0-9]([0-9]|_[0-9])*[l]?/i, // decimal long integer
         /[0-9]([0-9]|_[0-9])*\.[0-9]([0-9]|_[0-9])*/, // decimal float
         /\.[0-9]([0-9]|_[0-9])*e[-+]?[0-9]([0-9]|_[0-9])*[fd]?/i, // decimal float lacking leading zero
         /[0-9]([0-9]|_[0-9])*e[-+]?[0-9]([0-9]|_[0-9])*[fd]?/i, // float in mantissa/exponent form
      ],
      'symbol': /@/,
   }

   console.log('@@DEBUG', Prism, { 'log message': 'installed rholang syntax higlighting' });
}
