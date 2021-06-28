# RGOV Python Class Library

Any API added to the pyrgov python class should have a corresponding unit test added to the testing/unit_test directory using a logical name in the form test_xxx.py

## OCAP discipline

PyRGOV does not currently observe OCAP discipline. Continuing enhancements to the testing
framework should STRONGLY consider remediating this deficiency.

## Class function requirements

Each public function should correspond to the invocation of a single rholang file.
The first two lines of each rholang file will contain a match statement to properly pass in the parameters.
Note that passing in any PowerBox URI (typically "rho:" prefix) use the backquote ` not " or '
Each function must return a list where the first entry is a boolean signalling success/failure of the execution.
If the function is returning False then the second item is a string describing the failure.
If the function is returning Ture then the following items in the list are function dependent
Each function added should also add a corresponding synopsis if the function at the end of this file.

## Dependencies

These scripts are written for python3
At present the class functions rely upon the rchain/pyrchain python library which is the library that is used to perform regression tests on rnode prior to any release.
see https://github.com/rchain/pyrchain

## Example Usage

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0
rgov.close()

### Notes:
- rchain/pyrchain and pyrgov need to be added to the PYTHONPATH environment variable
- rchain/pyrchain needs to be properly installed
- the rgov.close() may not be required since the class destructor does this automatically
- you should be able to have more than one rgov instance open, so closing can add clarity

# RGOV Class API synopsis

## rgovAPI class constructor

rgov = rgovAPI('host')

Created a class instance of the rgovAPI which provides access to all public rholang contracts of rgov
The instance includes a connection to the specificed network and in theory you may be able to have more than one instance in use at any given time.

The currently defined networks are: localhost, testnet, demonet, rhobot and mainnet
The only network that has been tested is localhost

The class instance also loads a set of predefined private keys from bootstrap/PrivateKeys in the form pk.keyname, there will always be a pk.bootstrap which corresponds to the only REV Address created in genesis. Member functions can call self.get_private_key('name') to obtain a predefined PrivateKey

In the future we will likely move the network definitions to bootstrap in the same fashion so all rgov API can use them, eg. pyrgov, netify, others

## method checkBalance(self, rev[, block_hash]) -> int

lookup balance of wallet 'rev' with an exploratory deploy at optional block_hash and returns an int
If rev does not exist then there is no possible balance and 0 is returned.
The existance of the address can not be determined

## method transfer(self, from_addr: str, to_addr: str, amount: int, key: PrivateKey) -> str:

Attempt to transfer 'amount' REV from 'from_addr' to 'to_addr' signing the request with 'key'
In all cases tested the 'key' corresponded to the 'from_addr'

The method returns [status, msg] where
status is a boolean indicating the success of the transaction and
msg is a string containing additional details of the status

## method newInbox(self, key: PrivateKey) -> str:

Create a newInbox for the provided PrivateKey.
If an Inbox already exists it may be returned instead of creating a new one.
The method will read the MasterURI from rgov/src/MasterURI.`network`.json and pass it to the rholang to look up or save the inBox uri for future use.

The method returns any of the following:
[False, "no deploy data"]
[False, "URI not found"]
[True, strInboxURI]

## method newIssue(self, key: PrivateKey, inbox: str, issue: str, options: list) -> str:

Creates a newIssue and places it in the Inbox of the provided 'key'

Presently the only tested (supported?) value for 'inbox' has been "inbox"
The 'issue' is a string that may be any valid string, but only a single word has been tested.
The 'options' are a list of strings, but again only single words have been tested.

Developers are encouraged to explore adding unit tests and update these comments.

The method returns any of the following:
[False, "newIssue: options must have at least 2 choices"]
[False, "no deploy data"]
[False, "No status messages found", deployData]
[True, Status, deployData] (Status is all the g_strings returned by rholang)

## method addVoterToIssue(self, key: PrivateKey, locker: str, voter: str, issue: str) -> str:

Add a Voter identified by 'voter' a string in the form strInboxURI to the issue in the 'locker' of 'key' who is the creator of the issue.
The only locker tested (supported?) has been "inbox"

The method returns any of the following:
[False, "no deploy data"]
[True, deployData]

## method peekInbox(self, key: PrivateKey, inbox: str, type: str, subtype: str):

Look at the 'inbox' of 'key' for the type and subtype items.
Presently the only tested (supported?) arguments have been "inbox", "", ""

The method returns any of the following:
[False, "no deploy data"]
[False, "URI Not found"]
[True, strInboxURI]

## method castVote(self, key: PrivateKey, inbox: str, issue: str, choice: str):

Cast or update the vote of 'key' in the 'inbox' for 'issue'
The 'issue' must be in the 'inbox' see addVoterToIssue
The 'choice' must exist in the 'choices' when the issue was created (see newIssue)
In some cases of failure the valid choices will be returned

The method returns any of the following:
[False, "no deploy data"]
[False, ["unknown proposal", strChoices]] - bad format issue created to fix/TM
[True, oldVote, newVote]

## method delegateVote(self, key: PrivateKey, inbox: str, issue: str, delegate: str) -> str:

Sets or clears the strInboxURI that this 'key' delgates their vote to.
Returns the resulting delate strInboxURI or empty string

The method returns any of the following:
[False, "No issue found"]
[False, "URI Not found"]
[True, strInboxURI]

## method tallyVotes(self, key: PrivateKey, inbox: str, issue: str) -> str:

Looks at the 'issue' that 'key' has in the 'inbox' and returns a list of the choices voted on and the totals, including any delagated votes.
Only tested value for 'inbox' is "inbox" and only single word 'issue' names

The method returns any of the following:
[False, "No issue found"]
[False, {}] - No votes found, returns empty hash
[True, hashMap] - hashMap contains vote totals indexed by each 'choice' voted for
