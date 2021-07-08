#!/usr/bin/python3

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = PrivateKey.generate()
new2 = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(new2.get_public_key().get_rev_address())
assert balance == 0

funds = 100000000
result = rgov.transfer(admin.get_public_key().get_rev_address(), new1.get_public_key().get_rev_address(), funds, admin)
assert result[0]
result = rgov.transfer(admin.get_public_key().get_rev_address(), new2.get_public_key().get_rev_address(), funds, admin)
assert result[0]

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == funds
balance = rgov.checkBalance(new2.get_public_key().get_rev_address())
assert balance == funds

result = rgov.displayVote(new1, "inbox", "lunch")
print("No Inbox", result)
assert not result[0]

result = rgov.newInbox(new1)
assert result[0]
new1URI = result[1]

result = rgov.displayVote(new1, "inbox", "lunch")
print("No Issue", result)
assert not result[0]

result = rgov.newInbox(new2)
assert result[0]
new2URI = result[1]

result = rgov.newIssue(new1, "inbox", "lunch", ["pizza", "tacos", "salad"])
assert result[0]
result = rgov.addVoterToIssue(new1, "inbox", new2URI, "lunch")
assert result[0]

result = rgov.displayVote(new1, "inbox", "dinner")
print("Wrong Issue", result)
assert not result[0]

result = rgov.displayVote(new1, "inbox", "lunch")
print("No Vote", result)
assert result[0]
vote = result[1]
assert not 'vote' in vote

result = rgov.castVote(new1, "inbox", "lunch", "pizza")
assert result[0]
result = rgov.castVote(new2, "inbox", "lunch", "tacos")
assert result[0]

result = rgov.displayVote(new1, "inbox", "lunch")
print("Vote pizza", result)
assert result[0]
vote = result[1]
assert vote['vote'] == "pizza"

result = rgov.displayVote(new2, "inbox", "lunch")
print("Vote tacos", result)
assert result[0]
vote = result[1]
assert vote['vote'] == "tacos"

result = rgov.castVote(new1, "inbox", "lunch", "")
assert result[0]

result = rgov.displayVote(new1, "inbox", "lunch")
print("Vote nil", result)
assert result[0]
vote = result[1]
assert not 'vote' in vote

result = rgov.delegateVote(new1, "inbox", "lunch", new2URI)
print("Delegate", result)
assert result[0]

result = rgov.displayVote(new1, "inbox", "lunch")
print("Vote Delegated", result)
assert result[0]
vote = result[1]
assert vote['vote'] == "tacos"
