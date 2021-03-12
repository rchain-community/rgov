// @ts-check

// TODO: rholang goes in .rho files

import {
  MakeMintReg,
  DirectoryReg,
  CommunityReg,
  KudosReg,
  RollReg,
  IssueReg,
  InboxReg,
  LogReg
} from '../rhoid.js';

// const fs = require('fs');

// function rhofile(file) {
//   try {
//     const data = fs.readFileSync(file);
//     console.log(data);
//     return data;
//   } catch (err) {
//     console.error(err);
//     return err;
//   }
// }

/**
 * @typedef {{ template: string, fields?: Record<string, FieldSpec> }} ActionSpec
 * @typedef {{ type: 'string' | 'set' | 'uri' | 'walletRevAddr', value?: string }} FieldSpec
 * @type {Record<string, ActionSpec>}
 */
export const actions = {
  newIssue: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      name: { type: 'string', value: '' },
      //choice, choice, choice, ...
      proposals: {
        type: 'set',
        value: "",
      },
      issueURI: IssueReg
    },
    template:
    `
    new lookupCh, bCh, lookup(\`rho:registry:lookup\`),
    return(\`rho:rchain:deployId\`),
    deployerId(\`rho:rchain:deployerId\`) in {
      lookup!(issueURI, *lookupCh) |
      for(Issue <- lookupCh) {
        Issue!(proposals, *bCh) |
        for(admin, tally <- bCh) {
	  for (@{"inbox": *inbox, ..._} <<- @[*deployerId, lockerTag]) {
             inbox!(["issue", name, {"admin": *admin, "tally": *tally}], *return)
          }
        }
      }
    }
    `,
  },
  newMemberDirectory: {
    fields: {
      contractURI: DirectoryReg,
      rollReg: RollReg,
    },
    template: `new return(\`rho:rchain:deployId\`), lookup(\`rho:registry:lookup\`), regCh
    in {
      lookup!(contractURI, *regCh) | for (MemberDirectory <- regCh) {
        MemberDirectory!("makeFromURI", rollReg, *return)
      }
    }`,
  },
  claimWithInbox: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
      dirURI: DirectoryReg,
    },
    template: `new return, lookup(\`rho:registry:lookup\`), regCh in {
      lookup!(dirURI, *regCh) | for (memDir <- regCh) {
        memDir!("setup", myGovRevAddr, *return)
      }
    }`,
  },
  helloWorld: {
    template: `new world in { world!("Hello!") }`,
  },
  raviWorld: {
    template: `new ravi in { ravi!("Hello!") }`,
  },
  getRoll: {
    fields: {
      rollReg: RollReg,
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
      KudosReg: KudosReg,
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
      KudosReg: KudosReg,
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
      // TODO: get contract URIs from rhopm / rho_modules
      InboxURI: InboxReg,
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
  tallyVotes: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      issue: { value: '', type: 'string' }
    },
    template:
    `
    new
      return(\`rho:rchain:deployId\`),
      deployerId(\`rho:rchain:deployerId\`),
      ch
    in {
      for (@{ "peek": *peek, ..._ } <<- @[*deployerId, lockerTag]) {
        peek!("issue", issue, *ch) |
        for (@[{"tally": *tally, ...restOfStuff }] <- ch) {
          tally!(*return)
        }
      }
    }
    `,
  },
  castVote: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      issue: { value: '', type: 'string' },
      theVote: { value: '', type: 'string' }
    },
    template:
    `
    new
      ackCh,
      return(\`rho:rchain:deployId\`),
      deployerId(\`rho:rchain:deployerId\`),
      ch
    in {
      for(@{"peek": *peek, ..._} <<- @[*deployerId, lockerTag]) {
        peek!("vote", issue, *ch) |
        for (@[{"voterCap": voterCapability}] <- ch) {
          @voterCapability!("vote", theVote, *return, *return)
        }
      }
    }
    `,
  },
  addVoterToIssue: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      toInboxURI: { value: '', type: 'uri' },
      issue: { value: '', type: 'string'}
    },
    template:
      `new
        return(\`rho:rchain:deployId\`),
        deployerId(\`rho:rchain:deployerId\`),
        inboxLookup(\`rho:registry:lookup\`),
        ch,
        inboxCh
        in {
          for (@{ "peek": *peek, ..._ } <<- @[*deployerId, lockerTag]) {
            peek!("issue", issue, *ch) |
            for (@[{ "admin": *admin, ..._ }] <- ch) {
              admin!("giveRightToVote", *return, *ch) |
              for (voterCap <- ch) {
                inboxLookup!(toInboxURI, *inboxCh) |
                for (inbox <- inboxCh) {
                  inbox!(["vote", issue, {"voterCap": *voterCap}], *return)
                }
              }
            }
          }
        }`
  },
  sendMail: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      toInboxURI: { value: '', type: 'uri' },
      from: { value: '', type: 'string' },
      to: { value: '', type: 'string' },
      sub: { value: 'hello', type: 'string' },
      body: { value: 'hello from ravi for hackathon 2020', type: 'string' },
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
        for(@{"peek": *peek, ..._} <<- @[*deployerId, lockerTag]) {
          peek!(*deployId)
        }
      }`,
  },
  checkRegistration: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
      rollReg: RollReg,
    },
    template: `
    new return,
      lookup(\`rho:registry:lookup\`),
      ch in
    {
      lookup!(rollReg, *ch) |
      for (@addrSet <- ch) {
        return!(["#define", "$agm2020voter", addrSet.contains(myGovRevAddr)])
      }
    }`,
  },
  newCommunity: {
    fields: {
      name: { value: '', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' },
      CommunityReg: CommunityReg,
    },
    template: `
    new out, deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`),
  lookup(\`rho:registry:lookup\`), ret, ret2
in {
  lookup!(CommunityReg, *ret)|
  for ( C <- ret) {
        for(@{"inbox": *inbox, ..._} <<- @{[*deployerId, lockerTag]}) {
          C!("new", name, *inbox, *ret)|
          for (caps <- ret) {
            if (*caps != Nil) {
              inbox!(["Community", name, *caps], *deployId)
            } else {
              deployId!("newCommunity " ++ name ++ " failed")
            }
          }
        }
  }
}`,
  },
  addMember: {
    fields: {
      name: { type: 'string', value: '?' },
      themBoxReg: { type: 'uri', value: '?' },
      community: { type: 'string', value: '?' },
      lockerTag: { value: 'inbox', type: 'string' },
    },
    template: `
    new deployId(\`rho:rchain:deployId\`), deployerId(\`rho:rchain:deployerId\`), lookup(\`rho:registry:lookup\`),
    ret, boxCh, ack in {
      for(@{"peek": *peek, "inbox": *inbox, ..._} <<- @{[*deployerId, lockerTag]}) {
        lookup!(themBoxReg, *boxCh) |
        peek!("Community", community, *ret)|
        for ( @[{"admin": *admin, "read": *read, "write": *write, "grant": *grant}] <- ret; themBox <- boxCh ) {
          //stdout!("adding user")|
          admin!("add user", name, *inbox, *ret) |
          for (selfmod <- ret) {
            //stdout!("user added") |
            themBox!(["member", community, {"read": *read, "selfmod": *selfmod}], *deployId)
          }
        }
      }
    }`,
  },
  makeMint: {
    fields: {
      name: { value: 'myTokenMint', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' },
      MakeMintReg: MakeMintReg,
    },
    template: `
    new return, lookup(\`rho:registry:lookup\`),
  deployerId(\`rho:rchain:deployerId\`),
  deployId(\`rho:rchain:deployId\`),
  ch in {
  lookup!(MakeMintReg, *ch)
  |
  for (@(nonce, *MakeMint) <- ch) {
    MakeMint!(*ch) |
    for (aMint <- ch) {
      for (@{"inbox": *inbox, ..._} <<- @{[*deployerId, lockerTag]}) {
        // send the mint to my inbox for safe keeping.
        inbox!(["Mint", name, *aMint], *deployId)
      }
    }
  }
}`,
  },
};
