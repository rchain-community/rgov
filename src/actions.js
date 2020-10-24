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
  checkBalance: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
    },
    template: `new return, lookup(\`rho:registry:lookup\`), RevVaultCh, vaultCh, balanceCh
    in {
      lookup!(\`rho:rchain:revVault\`, *RevVaultCh) |
      for (@(_, RevVault) <- RevVaultCh) {
        @RevVault!("findOrCreate", myGovRevAddr, *vaultCh) |
        for (@(true, vault) <- vaultCh) {
          @vault!("balance", *balanceCh) |
          for (@balance <- balanceCh) {
            return!({"revAddr": myGovRevAddr, "balance (REVe-8)": balance})
          }
        }
      }
    }`,
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
