#!/usr/bin/python3

import time

from rchain.client import RClient
from rchain.crypto import PrivateKey
from rchain.util import create_deploy_data

from pyrgov.rgov import rgovAPI

TRANSFER_PHLO_LIMIT = 10000000
TRANSFER_PHLO_PRICE = 1

rgov = rgovAPI('localhost')

admin = rgov.get_private_key('bootstrap')
alpha = rgov.get_private_key('alpha')
bravo = rgov.get_private_key('bravo')
charlie = rgov.get_private_key('charlie')

result = rgov.newInbox(alpha)
assert result[0]
print("Alpha Inbox", result[1])
alphaURI = result[1]
result = rgov.newInbox(bravo)
assert result[0]
print("Bravo Inbox", result[1])
bravoURI = result[1]
result = rgov.newInbox(charlie)
assert result[0]
print("Charlie Inbox", result[1])
charlieURI = result[1]

balance = rgov.checkBalance(alpha.get_public_key().get_rev_address())
if balance > 0:
    print("Alpha has a non-zero balance, test has been run already, restore rgov snapshot")
    assert False

# 100 REV should be plenty
fund =10000000000
result = rgov.transfer(alpha.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), 100000000, new1)
assert result[0]
result = rgov.transfer(bravo.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), 100000000, new1)
assert result[0]
result = rgov.transfer(charlie.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), 100000000, new1)
assert result[0]

result = rgov.newIssue(alpha, "inbox", "lunch", ["pizza", "tacos", "salad"])
assert result[0]

result = rgov.peekInbox(alpha, "inbox", "", "")
assert result[0]
assert result[1] == alphaURI
result = rgov.peekInbox(bravo, "inbox", "", "")
assert result[0]
assert result[1] == bravoURI
result = rgov.peekInbox(charlie, "inbox", "", "")
assert result[0]
assert result[1] == charlieURI
result = rgov.addVoterToIssue(alpha, "inbox", bravoURI, "lunch")
print(result[0])
result = rgov.addVoterToIssue(alpha, "inbox", charlieURI, "lunch")
print(result[0])

result = rgov.castVote(bravo, "inbox", "lunch", "pizza")
assert result[0]
print("CastVote: Bravo change from ", result[1], " to ", result[2])

result = rgov.tallyVotes(bravo, "inbox", "lunch")
assert result[0]
print("Tally", result[1])

result = rgov.delegateVote(alpha, "inbox", "lunch", charlieURI)
assert result[0]
print("Vote Alpha Delegation is now ", result[1])

result = rgov.castVote(charlie, "inbox", "lunch", "salad")
assert result[0]
print("CastVote: Charlie change from ", result[1], " to ", result[2])

result = rgov.tallyVotes(charlie, "inbox", "lunch")
assert result[0]
print("Tally", result[1])

result = rgov.castVote(alpha, "inbox", "lunch", "pizza")
assert result[0]
print("CastVote: Alpha change from ", result[1], " to ", result[2])

result = rgov.tallyVotes(alpha, "inbox", "lunch")
assert result[0]
print("Tally", result[1])

rgov.close()
