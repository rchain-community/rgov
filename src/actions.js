// @ts-check

/**
 * @typedef {{ template: string, fields?: Record<string, FieldSpec> }} ActionSpec
 * @typedef {{ type: 'string' | 'uri' | 'walletRevAddr', value?: string }} FieldSpec
 * @type {Record<string, ActionSpec>}
 */
export const actions = {
  helloWorld: {
    template: `new world in { world!("Hello!") }`,
  },
  checkRegistration: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
      votersUri: {
        value: 'rho:id:admzpibb3gxxp18idri7h6eneg4io6myfmcmjhufc6asy73bgrojop',
        type: 'uri',
      },
    },
    template: `
    new return,
      lookup(\`rho:registry:lookup\`),
      ch in
    {
      lookup!(votersUri, *ch) |
      for (@addrSet <- ch) {
        return!(addrSet.contains(myGovRevAddr))
      }
    }`,
  },
};
