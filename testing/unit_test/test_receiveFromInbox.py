#!/usr/bin/python3

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = rgov.get_private_key('anonymous')
new2 = rgov.get_private_key('anonymous')
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

result = rgov.receiveFromInbox(new1, "inbox", "", "")
print("No Inbox", result)

result = rgov.newInbox(new1)
assert result[0]
new1URI = result[1]
print("new1URI", new1URI)

result = rgov.newInbox(new2)
assert result[0]
new2URI = result[1]
print("new1URI", new2URI)

result = rgov.receiveFromInbox(new1, "inbox", "", "")
print("No Messages Waiting", result)

result = rgov.sendMail(new1, "inbox", new1URI, "New2", "New1", "Test Message", "This is a Test")
print("sendMail", result)

result = rgov.receiveFromInbox(new1, "inbox", "", "")
print("New Message", result)
