#!/usr/bin/python3

import time

from rchain.client import RClient
from rchain.crypto import PrivateKey
from rchain.util import create_deploy_data

from pyrgov.rgov import rgovAPI

TRANSFER_PHLO_LIMIT = 10000000
TRANSFER_PHLO_PRICE = 1

USE_ABC = False
SHOW_RESULT = False

def show_error(where, result):
    if SHOW_RESULT:
        print("Show Result ", result)
    if not result[0]:
        print("Error: ", where, result[1])
    return

rgov = rgovAPI('localhost')

admin = rgov.get_private_key('bootstrap')

if USE_ABC:
    print("Using ABC")
    alpha = rgov.get_private_key('alpha')
    bravo = rgov.get_private_key('bravo')
    charlie = rgov.get_private_key('charlie')
else:
    # TODO: remove ambient access to PrivateKey.generate()
    print("Using random keys")
    # WARNING: ambient access
    alpha = PrivateKey.generate()
    print("Alpha is ", alpha.to_hex())
    # WARNING: ambient access
    bravo = PrivateKey.generate()
    print("Bravo is ", bravo.to_hex())
    # WARNING: ambient access
    charlie = PrivateKey.generate()
    print("Charlie is ", charlie.to_hex())

balance = rgov.checkBalance(alpha.get_public_key().get_rev_address())
if balance > 0:
    print("Alpha has a non-zero balance, test has been run already, restore rgov snapshot")
    assert False

# 100 REV should be plenty
fund =10000000000
result = rgov.transfer(admin.get_public_key().get_rev_address(), alpha.get_public_key().get_rev_address(), 100000000, admin)
show_error("Transfer", result)
assert result[0]
result = rgov.transfer(admin.get_public_key().get_rev_address(), bravo.get_public_key().get_rev_address(), 100000000, admin)
show_error("Transfer", result)
assert result[0]
result = rgov.transfer(admin.get_public_key().get_rev_address(), charlie.get_public_key().get_rev_address(), 100000000, admin)
show_error("Transfer", result)
assert result[0]

result = rgov.newInbox(alpha)
show_error("newInbox", result)
assert result[0]
print("Alpha Inbox", result[1])
alphaURI = result[1]
result = rgov.newInbox(bravo)
show_error("newInbox", result)
assert result[0]
print("Bravo Inbox", result[1])
bravoURI = result[1]
result = rgov.newInbox(charlie)
show_error("newInbox", result)
assert result[0]
print("Charlie Inbox", result[1])
charlieURI = result[1]

result = rgov.newIssue(alpha, "inbox", "lunch", ["pizza", "tacos", "salad"])
show_error("newIssue", result)
assert result[0]

result = rgov.peekInbox(alpha, "inbox", "", "")
show_error("peekInbox", result)
assert result[0]
assert result[1] == alphaURI
result = rgov.peekInbox(bravo, "inbox", "", "")
show_error("peekInbox", result)
assert result[0]
assert result[1] == bravoURI
result = rgov.peekInbox(charlie, "inbox", "", "")
show_error("peekInbox", result)
assert result[0]
assert result[1] == charlieURI
result = rgov.addVoterToIssue(alpha, "inbox", bravoURI, "lunch")
show_error("addVoterToIssue", result)
print(result[0])
result = rgov.addVoterToIssue(alpha, "inbox", charlieURI, "lunch")
show_error("addVoterToIssue", result)
print(result[0])

result = rgov.castVote(bravo, "inbox", "lunch", "pizza")
show_error("castVote", result)
assert result[0]
vote = result[1]
print("CastVote: Bravo change from ", vote[0], " to ", vote[1])

result = rgov.tallyVotes(bravo, "inbox", "lunch")
show_error("tallyVotes", result)
assert result[0]
print("Tally", result[1])

result = rgov.delegateVote(alpha, "inbox", "lunch", charlieURI)
show_error("delegateVote", result)
assert result[0]
print("Vote Alpha Delegation is now ", result[1])

result = rgov.castVote(charlie, "inbox", "lunch", "salad")
show_error("castVote", result)
assert result[0]
vote = result[1]
print("CastVote: Charlie change from ", vote[0], " to ", vote[1])

result = rgov.tallyVotes(charlie, "inbox", "lunch")
show_error("tallyVotes", result)
assert result[0]
print("Tally", result[1])

result = rgov.castVote(alpha, "inbox", "lunch", "pizza")
show_error("castVote", result)
assert result[0]
vote = result[1]
print("CastVote: Alpha change from ", vote[0], " to ", vote[1])

result = rgov.tallyVotes(alpha, "inbox", "lunch")
show_error("tallyVotes", result)
assert result[0]
print("Tally", result[1])

rgov.close()
