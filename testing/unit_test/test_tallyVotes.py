#!/usr/bin/python

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = PrivateKey.generate()
new2 = PrivateKey.generate()
new3 = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(new2.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(new3.get_public_key().get_rev_address())
assert balance == 0

funds = 100000000
result = rgov.transfer(admin.get_public_key().get_rev_address(), new1.get_public_key().get_rev_address(), funds, admin)
assert result[0]
result = rgov.transfer(admin.get_public_key().get_rev_address(), new2.get_public_key().get_rev_address(), funds, admin)
assert result[0]
result = rgov.transfer(admin.get_public_key().get_rev_address(), new3.get_public_key().get_rev_address(), funds, admin)
assert result[0]

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == funds
balance = rgov.checkBalance(new2.get_public_key().get_rev_address())
assert balance == funds
balance = rgov.checkBalance(new3.get_public_key().get_rev_address())
assert balance == funds

result = rgov.newInbox(new1)
assert result[0]
new1URI = result[1]

result = rgov.newInbox(new2)
assert result[0]
new2URI = result[1]

result = rgov.newInbox(new3)
assert result[0]
new3URI = result[1]

result = rgov.newIssue(new1, "inbox", "lunch", ["pizza", "tacos", "salad"])
assert result[0]
result = rgov.addVoterToIssue(new1, "inbox", new2URI, "lunch")
assert result[0]
result = rgov.addVoterToIssue(new1, "inbox", new3URI, "lunch")
assert result[0]

result = rgov.castVote(new1, "inbox", "lunch", "pizza")
assert result[0]
result = rgov.castVote(new2, "inbox", "lunch", "tacos")
assert result[0]
result = rgov.castVote(new3, "inbox", "lunch", "salad")
assert result[0]

result = rgov.tallyVotes(new1, "inbox", "lunch")
print(result)
assert result[0]
votes = result[1]
assert votes['pizza'] == 1
assert votes['salad'] == 1
assert votes['tacos'] == 1
