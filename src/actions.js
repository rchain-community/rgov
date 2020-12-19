// @ts-check

// TODO: rholang goes in .rho files

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
   raviWorld: {
      template: `new ravi in { ravi!("Hello!") }`,
    },

  getRoll: {
    fields: {
      rollReg: {
        type: 'uri',
        // AGM2020 voter list on mainnet
        // value: 'rho:id:admzpibb3gxxp18idri7h6eneg4io6myfmcmjhufc6asy73bgrojop',
        // testnet
        value: 'rho:id:kiijxigqydnt7ds3w6w3ijdszswfysr3hpspthuyxz4yn3ksn4ckzf',
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
            return!(["#define", "$myBalance", balance])
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
  sendMail:{
    fields: {
          lockerTag: { value: 'inbox', type: 'string' },
          toInboxURI : {value: '' , type: 'uri'},
          from: { value: '', type: 'string'},
          to: { value: '', type: 'string'},
          sub: { value: 'hello', type: 'string'},
          body: { value: 'hello from ravi for hackathon 2020', type: 'string'},
      },
    template:
        `new deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`),

        lookup(\`rho:registry:lookup\`), inboxCh
        in {
            lookup!(toInboxURI, *inboxCh) |
            for (toinbox <- inboxCh) {
                toinbox!({"from": from, "to": to, "sub": sub, "body": body}, *deployId)
            }
      }`,
   },
  peekInbox: {
      fields: {
        lockerTag: { value: 'inbox', type: 'string' },
      },
      template: `new deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`), ch
      in {
        for(@stuff <<- @[*deployerId, lockerTag]) {
          @{stuff.get("peek")}!(*deployId)
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
  newCommunity: {
    fields: {
      name: { value: '', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' },
      CommunityReg: {
        value: 'rho:id:ojkxxx95izqftspy5515fj58z58qrcc3ii9gktjcdo8d9hcqqnsuc9',
        type: 'uri',
      },
    },
    template: `
    new out, deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`),
  lookup(\`rho:registry:lookup\`), ret, ret2
in {
  lookup!(CommunityReg, *ret)|
  for ( C <- ret) {
    match {[*deployerId, lockerTag]} {
      {*lockerPart} => {
        for(@boxStuff <<- lockerPart) {
          C!("new", name, boxStuff.get("inbox"), *ret)|
          for (caps <- ret) {
            if (*caps != Nil) {
              @{boxStuff.get("inbox")}!(["Community", name, *caps], *deployId)
            } else {
              deployId!("newCommunity " ++ name ++ " failed")
            }
          }
        }
      }
    }
  }
}`,
  },
  addMember: {
    // TODO: fields
    template: `
    new deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`), lookup(\`rho:registry:lookup\`),
       ret, boxCh, ack in {
      match {[*deployerId, lockerTag]} {
        {*lockerPart} => {
          for(@boxStuff <<- lockerPart) {
            lookup!(themBoxReg, *boxCh) |
            @{boxStuff.get("peek")}!("Community", community, *ret)|
            for ( @[{"admin": *admin, "read": *read, "write": *write, "grant": *grant}] <- ret; themBox <- boxCh ) {
              //stdout!("adding user")|
              admin!("add user", user, boxStuff.get("inbox"), *ret) |
              for (selfmod <- ret ) {
                //stdout!("user added") |
                themBox!(["member", community, {"read": *read, "selfmod": *selfmod}], *deployId)
              }
            }
          }
        }
      }
    }`,
  },
};
