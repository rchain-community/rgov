/*Attach vote function to click on selectable cells*/

var tableDiv = document.getElementById('table');
var tableBodyDiv = document.getElementById('table-body');

let state = {
  issues: [
    {
      id: 0,
      desc: 'Who is president ?',
      type: 'choices',
      choices: ['Donald Trump', 'Joe Biden', 'Michael Jordan'],
    },
    {
      id: 1,
      desc: 'Bla',
      type: 'choices',
      choices: ['support', 'abstain', 'oppose'],
    },
    {
      id: 2,
      desc:
        'Blabla very long issue to make sure nothing overlapse so does it ? I guess it is okay but who knows what happens wit css sometimes',
      type: 'choices',
      choices: ['support', 'abstain', 'oppose'],
    },
    {
      id: 3,
      desc: 'More cycle lanes in the world',
      type: 'choices',
      choices: ['support', 'abstain', 'oppose'],
    },
  ],
  votes: {},
};

// REDUCERS
const initializeVotes = () => {
  let newVotes = {};
  state.issues.forEach((iss) => {
    newVotes[iss.id] = { vote: null };
  });
  state = {
    ...state,
    votes: newVotes,
  };
};

const vote = (e, issueId, vote) => {
  console.log(e);

  state = {
    ...state,
    votes: {
      ...state.votes,
      [issueId]: vote,
    },
  };
  console.log(state);
};

initializeVotes();

const getIcon = (issueId, vote1) => {
  console.log('getIcon');

  if (state.votes[issueId].vote === vote1)
    return m('i', {
      class: 'envelope icon selected ' + vote,
      row: issueId,
      role: vote1,
    });
  else
    return m('i', {
      class: 'envelope outline icon',
      row: issueId,
      role: vote1,
      onclick: (e) => vote(e, issueId, vote1),
    });
};

const tableHeader = {
  view: () => {
    return [
      m('tr', [
        m('th', { class: 'table-icon' }),
        m('th', { class: 'table-title' }, 'Issues'),
        m('th', 'Support'),
        m('th', 'Abstain'),
        m('th', 'Oppose'),
      ]),
    ];
  },
};

m.mount(document.getElementById('table-header'), tableHeader);

const tableBody = {
  view: () => {
    console.log(state.votes);
    return state.issues.map((issue) => {
      if (issue.type === 'choices') {
        return m('tr', [
          m('td', { class: 'id-cell' }, issue.id),
          m('td', { class: 'issue-description' }, issue.desc),
          issue.choices.map((choice) => {
            return m('td', { class: 'selectable' }, [
              m(
                'a',
                {
                  class: 'voting-link',
                  href: '#',
                },
                [getIcon(issue.id, choice)],
              ),
            ]);
          }),
        ]);
      } else {
        console.error('Unsupported issue type');
      }
    });
  },
};

m.mount(tableBodyDiv, tableBody);
