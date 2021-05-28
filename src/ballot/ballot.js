/*Attach vote function to click on selectable cells*/

var tableDiv = document.getElementById('table');
var tableBodyDiv = document.getElementById('table-body');

let state = {
  issues: {},
};

const issues = [
  { id: 0, desc: 'Bla' },
  {
    id: 1,
    desc:
      'Blabla very long issue to make sure nothing overlapse so does it ? I guess it is okay but who knows what happens wit css sometimes',
  },
  { id: 2, desc: 'More cycle lanes in the world' },
];

const initializeVotes = () => {
  issues.forEach((iss) => {
    state.issues[iss.id] = { id: iss.id, vote: null };
  });
};
initializeVotes();

const vote = (e) => {
  e.preventDefault();
  const row = e.target.getAttribute('row');
  const role = e.target.getAttribute('role');
  state.issues[row].vote = role;
};

const getIcon = (row, role) => {
  if (state.issues[row].vote !== role)
    return m('i', {
      class: 'envelope outline icon',
      row: row,
      role: role,
      onclick: (e) => vote(e),
    });
  else
    return m('i', {
      class: 'envelope icon selected ' + role,
      row: row,
      role: role,
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
    return issues.map((issue) => {
      return m('tr', [
        m('td', { class: 'id-cell' }, issue.id),
        m('td', { class: 'issue-description' }, issue.desc),
        m('td', { class: 'selectable' }, [
          m('a', { class: 'voting-link', href: '' }, [
            getIcon(issue.id, 'support'),
          ]),
        ]),
        m('td', { class: 'selectable' }, [
          m('a', { class: 'voting-link', href: '' }, [
            getIcon(issue.id, 'abstain'),
          ]),
        ]),
        m('td', { class: 'selectable' }, [
          m('a', { class: 'voting-link', href: '' }, [
            getIcon(issue.id, 'oppose'),
          ]),
        ]),
      ]);
    });
  },
};

m.mount(tableBodyDiv, tableBody);
