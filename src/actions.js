// @ts-check
import uris from '../ReadcapURI.json' // gives error but works correctly. https://mariusschulz.com/blog/importing-json-modules-in-typescript
console.log(uris.ReadcapURI)
// TODO: rholang goes in .rho files

/**
 * @typedef {{ filename: string, fields?: Record<string, FieldSpec> }} ActionSpec
 * @typedef {{ type: 'number' | 'string' | 'set' | 'uri' | 'walletRevAddr', value?: string }} FieldSpec
 * @type {Record<string, ActionSpec>}
 */
export const actions = {
  helloWorld: {
    fields: {},
    filename: 'actions/helloWorld.rho',
  },
  checkBalance: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
    },
    filename: 'actions/checkBalance.rho',
  },
  newinbox: {
    fields: {
      ReadcapURI: { value: uris.ReadcapURI, type: 'uri' },
    },
    filename: 'actions/newinbox.rho',
  },
  peekInbox: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
    },
    filename: 'actions/peekInbox.rho',
  },
  sendMail: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      toInboxURI: { value: '', type: 'uri' },
      from: { value: '', type: 'string' },
      to: { value: '', type: 'string' },
      sub: { value: '', type: 'string' },
      body: { value: '', type: 'string' },
    },
    filename: 'actions/sendMail.rho',
  },
  lookupURI: {
    fields: { URI: { value: '', type: 'uri'} },
    filename: 'actions/lookupURI.rho',
  },
  transfer: {
    fields: {
      revAddrFrom: { value: '', type: 'walletRevAddr' },
      revAddrTo: { value: '', type: 'string'},
      amount: { value: '1', type: 'number' }
    },
    filename: 'actions/transfer.rho',
  },
  newIssue: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      name: { type: 'string', value: '' },
      //choice, choice, choice, ...
      proposals: {
        type: 'set',
        value: "",
      }
    },
    filename: 'actions/newIssue.rho',
  },
  addVoterToIssue: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      toInboxURI: { value: '', type: 'uri' },
      issue: { value: '', type: 'string'}
    },
    filename: 'actions/addVoterToIssue.rho',
  },
  castVote: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      issue: { value: '', type: 'string' },
      theVote: { value: '', type: 'string' }
    },
    filename: 'actions/castVote.rho',
  },
  choiceVote: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      issue: { value: '', type: 'string' },
    },
    filename: 'actions/choiceVote.rho',
  },
  tallyVotes: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      issue: { value: '', type: 'string' }
    },
    filename: 'actions/tallyVotes.rho',
  },
  getRoll: {
    fields: {},
    filename: 'actions/getRoll.rho',
  },
  peekKudos: {
    fields: {},
    filename: 'actions/peekKudos.rho',
  },
  awardKudos: {
    fields: {
      them: { type: 'string', value: '' }
    },
    filename: 'actions/awardKudos.rho',
  },
  newCommunity: {
    fields: {
      name: { value: '', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' }
    },
    filename: 'actions/newCommunity.rho',
  },
  addMember: {
    fields: {
      name: { type: 'string', value: '?' },
      themBoxReg: { type: 'uri', value: '?' },
      community: { type: 'string', value: '?' },
      lockerTag: { value: 'inbox', type: 'string' },
    },
    filename: 'actions/addMember.rho',
  },
  newMemberDirectory: {
    fields: {},
    filename: 'actions/newMemberDirectory.rho',
  },
  claimWithInbox: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' }
    },
    filename: 'actions/claimWithInbox.rho',
  },
  CallForHelp: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      toInboxURI: { value: '', type: 'uri' },
      from: { value: '', type: 'string' },
      tips: { value: '', type: 'string' },
      revletts: { value: "100000000", type: 'number' },
      body: { value: 'hello from ravi for hackathon 2020', type: 'string' },
    },
    filename: 'actions/CallForHelp.rho',
  },
  checkRegistration: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' }
    },
    filename: 'actions/checkRegistration.rho',
  },
  makeMint: {
    fields: {
      name: { value: 'myTokenMint', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' }
    },
    filename: 'actions/makeMint.rho',
  },
};
