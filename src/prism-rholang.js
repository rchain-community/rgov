// following the instructions laid out in
// https://prismjs.com/extending.html#language-definitions
// @ts-check

/* TODO These regular expressions are not optimized.
   A JS regex interpreter with sample data should be used
   to analyze the number of steps required for each of them.
   Of particular note are the regex for floating point numbers.
*/

export const RholangGrammar = {
  /* We don't handle C-style multiline comments yet
     The regex for it is sickenly complicated and may make
     the web page unusably slow when typing.
     Also, we assume strings do not contain comments
  */
  comment: {
    pattern: /\/\/.*/,
    inside: { italic: /\b(TODO|FIXME|XXX|NOTE)[ \t]\b.*/i },
  },
  string: /"[^"]*"/,
  url: [
    /`[^`]*`/,
  ],
  keyword: [
    /\b(contract|for|in|if|else|match|new|select|case|bundle[-0\+])\b/,
  ],
  punctuation: [
    /\(|\[|\{|\}|\]|\)|:/,
  ],
  number: [
    /0b[0-1]+/, // binary integer
    /0x([0-9a-fA-F])+/, // hexadecimal integer
    /\b[0-9]\b([0-9]|_[0-9])*[l]?/i, // decimal long integer
    /\b[0-9]\b([0-9]|_[0-9])*\.[0-9]([0-9]|_[0-9])*/, // decimal float
    /\.[0-9]([0-9]|_[0-9])*(e[-+])?[0-9]([0-9]|_[0-9])*[fd]?/i, // decimal float lacking leading zero
    /\b[0-9]\b([0-9]|_[0-9])*(e[-+])?[0-9]([0-9]|_[0-9])*[fd]?/i, // float in mantissa/exponent form
    // This should come last
    /0[0-7]*/, // octal integer (including literal zero!)
  ],
  operator: [
    // TODO The literal underscore regex needs help
    /!|<-|<<-|<=|=>|_|\.\.\./,
    /\b(\+|-|\*|\||\/|(==)|=)\b/,
    /\b(not|and|or)\b/,
  ],
  symbol: /@/,
};
