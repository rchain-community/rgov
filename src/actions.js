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
  newinbox: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      InboxURI: {
        value: 'rho:id:ohyqkr5jmritq8chnwijpufbx3tan6d1hffiksg9qiz9rmuy97a51t',
        type: 'uri',
      },
    },
    template: `
    new deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`),
      lookup(\`rho:registry:lookup\`), insertArbitrary(\`rho:registry:insertArbitrary\`),
      inboxCh, capabilities, ret
    in {
      lookup!(InboxURI, *inboxCh) |
      for (Inbox <- inboxCh) {
        Inbox!(*capabilities) |
        for (receive, send, peek <- capabilities) {
          @[*deployerId, lockerTag]!({"inbox": *send, "receive": *receive, "peek": *peek}) |
          insertArbitrary!(*send, *ret)|
          for (@uri <- ret) {
            // TODO: stdout!(["#define $inbox_" ++ $myusername, *uri])
            deployId!({"inboxURI": "\${uri}" %% {"uri": uri }, "lockerTag": lockerTag})
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
