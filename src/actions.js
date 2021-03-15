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

/**
 * @typedef {{ filename: string, fields?: Record<string, FieldSpec> }} ActionSpec
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
    filename: 'actions/newIssue.rho',
  },
  newMemberDirectory: {
    fields: {
      contractURI: DirectoryReg,
      rollReg: RollReg,
    },
    filename: 'actions/newMemberDirectory.rho',
  },
  claimWithInbox: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
      dirURI: DirectoryReg,
    },
    filename: 'actions/claimWithInbox.rho',
  },
  helloWorld: {
    fields: {},
    filename: 'actions/helloWorld.rho',
  },
  raviWorld: {
    fields:{},
    filename: 'actions/raviWorld.rho',
  },
  getRoll: {
    fields: {
      rollReg: RollReg,
    },
    filename: 'actions/getRoll.rho',
  },
  peekKudos: {
    fields: {
      KudosReg: KudosReg,
    },
    filename: 'actions/peekKudos.rho',
  },
  awardKudos: {
    fields: {
      them: { type: 'string', value: '' },
      KudosReg: KudosReg,
    },
    filename: 'actions/awardKudos.rho',
  },
  checkBalance: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
    },
    filename: 'actions/checkBalance.rho',
  },
  newinbox: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      // TODO: get contract URIs from rhopm / rho_modules
      InboxURI: InboxReg,
    },
    filename: 'actions/newinbox.rho',
  },
  tallyVotes: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      issue: { value: '', type: 'string' }
    },
    filename: 'actions/tallyVotes.rho',
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
  addVoterToIssue: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
      toInboxURI: { value: '', type: 'uri' },
      issue: { value: '', type: 'string'}
    },
    filename: 'actions/addVoterToIssue.rho',
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
    filename: 'actions/sendMail.rho',
  },
  peekInbox: {
    fields: {
      lockerTag: { value: 'inbox', type: 'string' },
    },
    filename: 'actions/peekInbox.rho',
  },
  checkRegistration: {
    fields: {
      myGovRevAddr: { type: 'walletRevAddr' },
      rollReg: RollReg,
    },
    filename: 'actions/checkRegistration.rho',
  },
  newCommunity: {
    fields: {
      name: { value: '', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' },
      CommunityReg: CommunityReg,
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
  makeMint: {
    fields: {
      name: { value: 'myTokenMint', type: 'string' },
      lockerTag: { value: 'inbox', type: 'string' },
      MakeMintReg: MakeMintReg,
    },
    filename: 'actions/makeMint.rho',
  },
};
