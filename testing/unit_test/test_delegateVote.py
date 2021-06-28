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

result = rgov.newInbox(new1)
assert result[0]
new1URI = result[1]

result = rgov.newInbox(new2)
assert result[0]
new2URI = result[1]

result = rgov.newIssue(new1, "inbox", "lunch", ["pizza", "tacos", "salad"])
assert result[0]

# Tally votes when none have been cast
# issue 197
#result = rgov.tallyVotes(new1, "inbox", "lunch")
#print("Tally Votes", result)
#assert result[0]
#votes = result[1]

result = rgov.castVote(new1, "inbox", "lunch", "pizza")
assert result[0]

#delegate vote when no permissons to the issue
result = rgov.delegateVote(new2, "inbox", "lunch", new1URI)
assert not result[0]

# tally votes when no permissions to the issue
result = rgov.tallyVotes(new2, "inbox", "lunch")
assert not result[0]

result = rgov.addVoterToIssue(new1, "inbox", new2URI, "lunch")
assert result[0]

result = rgov.delegateVote(new2, "inbox", "lunch", new1URI)
assert result[0]
delegate = result[1]
assert delegate[1] == new1URI

result = rgov.tallyVotes(new1, "inbox", "lunch")
assert result[0]
votes = result[1]
assert votes['pizza'] == 2

result = rgov.castVote(new2, "inbox", "lunch", "salad")
assert result[0]

result = rgov.tallyVotes(new1, "inbox", "lunch")
assert result[0]
votes = result[1]
assert votes['pizza'] == 1
assert votes['salad'] == 1

# delegate vote on an issue that does not exist
result = rgov.delegateVote(new2, "inbox", "none", new1URI)
assert not result[0]
