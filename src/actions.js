// @ts-check

// TODO: expression macros, blockly UX
/** @type { FieldSpec } */
const KudosReg = {
  type: 'uri',
  value: 'rho:id:eifmzammsbx8gg5fjghjn34pw6hbi6hqep7gyk4bei96nmra11m4hi',
};

/**
 * @typedef {{ template: string, fields?: Record<string, FieldSpec> }} ActionSpec
 * @typedef {{ type: 'string' | 'uri' | 'walletRevAddr', value?: string }} FieldSpec
 * @type {Record<string, ActionSpec>}
 */
export const actions = {
  helloWorld: {
    template: `new world in { world!("Hello!") }`,
  },
  getRoll: {
    fields: {
      rollReg: {
        type: 'uri',
        // AGM2020 voter list on mainnet
        value: 'rho:id:admzpibb3gxxp18idri7h6eneg4io6myfmcmjhufc6asy73bgrojop',
      },
    },
    template: `
    new ret, ch, lookup(\`rho:registry:lookup\`) in {
      lookup!(rollReg, *ch) |
      for (@set <- ch) {
        ret!(["#define", "$roll", set.toList()])
      }
    }`,
  },
  peekKudos: {
    fields: {
      KudosReg,
    },
    template: `
    new return,
      lookup(\`rho:registry:lookup\`), ch
    in {
      lookup!(KudosReg, *ch) | for (Kudos <- ch) {
        Kudos!("peek", *ch) | for (@current <-ch ) {
          return!(["#define", "$kudos", current])
        }
      }
    }
    `,
  },
  awardKudos: {
    fields: {
      them: { type: 'string', value: '' },
      KudosReg,
    },
    template: `
    new deployId(\`rho:rchain:deployId\`),
      lookup(\`rho:registry:lookup\`), ch
    in {
      lookup!(KudosReg, *ch) | for (Kudos <- ch) {
        Kudos!("award", them, *ch) | for (@current <- ch) {
          deployId!(["#define", "$kudos", current])
        }
      }
    }
    `,
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
            return!(["#define", "$myBalance", balance]})
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
          insertArbitrary!(*send, *ret)|
          for (@uri <- ret) {
            @[*deployerId, lockerTag]!({"inbox": *send, "receive": *receive, "peek": *peek, "URI": uri}) |
            deployId!(["#define", "$" ++ lockerTag, uri])
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
        return!(["#define", "$agm2020voter", addrSet.contains(myGovRevAddr)])
      }
    }`,
  },
};
