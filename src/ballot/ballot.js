/*Attach vote function to click on selectable cells*/

var tableDiv = document.getElementById('table');
var tableBodyDiv = document.getElementById('table-body');

const state = {
  get issues() {
    return issues;
  },
  issues: [
    {
      id: 0,
      desc: 'More vegetables in school restaurants',
      type: 'choices',
      choices: ['support', 'abstain', 'oppose'],
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
  get votes() {
    return votes;
  },
  set votes(newVotes) {
    votes = newVotes;
  },
};

// REDUCERS
const initializeVotes = () => {
  let newVotes = {};
  state.issues.forEach((iss) => {
    newVotes[iss.id] = null;
  });
  state.votes = newVotes;
};

const vote = (e, issueId, vote) => {
  e.preventDefault();
  console.log(state.votes);
  state.votes = { ...state.votes, [issueId]: vote };
  console.log(state.votes);
};

initializeVotes();

const getIcon = (issueId, choice) => {
  if (state.votes[issueId] === choice) {
    return m(
      'div',
      {
        class: 'ui fitted checked checkbox',
        row: issueId,
        role: choice,
        cursor: 'pointer',
      },
      [
        m('input', {
          type: 'checkbox',
          checked: 'a',
        }),
        m('label'),
      ],
    );
  } else {
    return m(
      'div',
      {
        class: 'ui fitted checkbox',
        row: issueId,
        role: choice,
        cursor: 'pointer',
      },
      [
        m('input', {
          type: 'checkbox',
        }),
        m('label'),
      ],
    );
  }
};

const submit = () => {
  console.log(state);
};

/* COMPONENTS */

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
                  onclick: (e) => vote(e, issue.id, choice),
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

// const checkBox = (isChecked) => {
//   let checkedClass;
//   if (isChecked === true ) {
//      =
//   }
//   if (isChecked === true) {
//     return m(
//       'div',
//       {
//         class: 'ui checked checkbox' + choice,
//         row: issueId,
//         role: choice,
//         cursor: pointer,
//       },
//       [
//         m('input', {
//           type: 'checkbox',
//           checked: '',
//         }),
//       ],
//     );
//   } else {
//     return m(
//       'div',
//       {
//         class: 'ui checkbox' + choice,
//         row: issueId,
//         role: choice,
//         cursor: pointer,
//       },
//       [
//         m('input', {
//           type: 'checkbox',
//           checked: '',
//         }),
//       ],
//     );
//   }
// };
