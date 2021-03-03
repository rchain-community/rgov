/**
 * @title Ballot - a one-member-one-vote contract
 *
 * "A member may cast his or her vote solely by means of written
 * or electronic ballot. Whether or not the member is present in
 * person at the meeting or by proxy, his or her vote will be counted
 * only if (a) it is submitted on the form of ballot furnished by
 * the Secretary for use in connection with the meeting, and
 * (b) the executed ballot is received by the Secretary no later than
 * whatever deadline for ballot submissions the
 * Nominating and Governance Committee may designate for the purpose
 * of allowing the Secretary sufficient time to count the votes cast,
 * which deadline may not be more than seven days prior to the
 * commencement of the meeting"
 * -- Artile II section 6 Amended Bylaws October 8, 2018
 * https://github.com/rchain/board/blob/master/Bylaws.md#user-content-voting
 *
 * Note: the questions and answers are fixed before any ballots are issued.
 *
 * TODO: cancelBallot method in case a member loses control
 *       of their ballot and requests a re-issue.
 * ISSUE: put voter states in a map to give them names (e.g. to support cancel)?
 * ISSUE: keep voter metadata?
 */
// @flow strict

// import { insertArbitrary } from 'rho:registry';
function insertArbitrary(thing) {
  return 'rho:registry:TODO';
}

console.log({"Secretary": insertArbitrary(Secretary)});


// Demo / example
async function demo() {
  // Construct a Secretary by giving a title and a map from
  // question to set of answers.
  const secretary = Secretary("Lincoln v Douglas", {"President": ["Lincoln", "Douglas"]});
  console.log({"Secretary returned": secretary});

  // Instruct the secretary to issueBallot for each voter.
  const v1 = secretary.issueBallot();
  const v2 = secretary.issueBallot();
  const v3 = secretary.issueBallot();
  const v4 = secretary.issueBallot();

  // TODO: layer delegation on top.
  // v3!("delegate", "jimscarver", *v3Ch) |
  // v2!("delegate", "Owens", *v3Ch) |
  // v2!("delegate", "Owans", *v3Ch) |
  // for(_1 <- v3Ch; _2 <- v3Ch ) {
  console.log("voting.");

  // Cast a ballot by giving a map of question to answer.
  v1.vote({"President": "Lincoln"});
  // A voter may revise their answers to one or more questions.
  v1.vote({"President": "Douglas"});
  // Only questions and answers on the ballot are accepted.
  try {
    v1.vote({"President": "Abe Lincoln"});
  } catch(oops) {
    console.log(oops);
  }

  v2.vote({"President": "Lincoln"});
  v3.vote({"President": "Lincoln"});
  v4.vote({"President": "Lincoln"});
  console.log("votes done");

  // Get a read-only facet of the secretary.
  const counter = secretary.getCounterFacet();
  // Count the votes cast.
  const votes = counter.countVotesCast();
  console.log({"votes": votes});

  // Use the read-only facet to get the title, questions.
  console.log(counter.title());
  console.log(counter.questions());
}

function harden/*:: <T>*/(x /*: T */) /*: T */{
  return Object.freeze(x);
}

function getOrElse/*::<T>*/(o/*{[string]: T} */, p /*: string */, d /*: T */) /*: T */ {
  const v = o[p];
  if (v === undefined) {
    return d;
  }
  return v;
}

function peek/*:: <T>*/(ch/*: Channel<T> */) /*: T*/ {
  return ch[0];
}

function entries/*:: <T> */(obj /*: {[string]: T} */) /*: [string, T][] */ {
  // $FlowFixMe
  return Object.entries(obj);
}

/*::
type Channel<T> = Array<T>;

type Agenda = {[string]: string[]};
type Choices = { [string]: string };
type Tally = {[string]: { [string]: number }}
*/
exports.Secretary = Secretary;
function Secretary(title /*: string */, questions /*: Agenda */) {
  const voterStatesCh /*Array<Channel<Choices>> */ = [[]];

  const counter = harden({
    questions: () => questions,
    title: () => title,
    countVotesCast() {
      console.log("countVotesCast");

      return peek(voterStatesCh).reduce((acc /*: Tally */, v0Ch /*: Channel<Choices> */) => {
        // console.log({"reduceVoters acc": acc});
        const choices = peek(v0Ch);
        // console.log({"tallying": choices});
        return entries(choices).reduce((acc2 /*: Tally */, [q0, a0]) => {
          // console.log({"reduceChoices acc": acc});
          // bogus questions / answers are filtered out in vote below
          const answerCounts /*: {[string]: number} */ = getOrElse(acc2, q0, {});
          const newCount = getOrElse(answerCounts, a0, 0) + 1;
          return { ...acc2, [q0]: { ...answerCounts, [a0]: newCount}};
        }, acc);
      }, {});
    },
  });

  function Voter(questions) {
    // return a channel for casting votes and for reading the results
    // ISSUE: we trust the caller to peek at the choices and not consume them.
    const choicesCh /*: Channel<Choices> */= [{}];
    const voter = harden({
      vote(newChoices /*: Choices */) {
        // log!({"voter": *voter, "newChoices": newChoices}) |
        const previous = choicesCh.pop();
        // console.log({"voter": voter, "newChoices": newChoices, "previous": previous});
        return checkChoices(entries(newChoices), previous);

        function checkChoices(toCheck, checked /*: Choices */) {
          if (toCheck.length === 0) {
            // console.log({"voter": voter, "choices": checked, "replaced": previous});
            choicesCh.push(checked);
            return [true, checked];
          } else {
            const [[q, a], ...rest] = toCheck;
            const answers = questions[q];
            if (answers === undefined) {
              choicesCh.push(previous);
              console.log({"voter": voter, "no such question": q});
              throw new Error(`no such question ${q}`);
            }
            if (!answers.includes(a)) {
              choicesCh.push(previous);
              console.log({"voter": voter, "question": q, "no such answer": a, "checked": checked});
              throw new Error(`no such answer: ${q}: ${a}`);
            }
            return checkChoices(rest, { ...checked, [q]: a});
          }
        }
      }
    });
    return [voter, choicesCh];
  }

  const secretary = harden({
    getCounterFacet() {
      // log!("getCounterFacet") |
      return counter;
    },
    issueBallot() {
      const [voter, choicesCh] = Voter(questions);
      const voterChoices = voterStatesCh.pop();
      voterStatesCh.push([...voterChoices, choicesCh]);
      console.log({"nth": voterChoices.length, "->voter": voter});
      return(voter);
    },
  });

  console.log({"meeting title": title,
               // js2rho issue: .foo, not .foo()
               "# questions": questions.size,
               "->secretary": secretary});
  return secretary;
}

if (require.main === module) {
  (async () => { await demo(); })().catch(oops => { console.error(oops); });
}

