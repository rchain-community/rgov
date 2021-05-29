#!/usr/bin/python

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

funds = 12300000000
result = rgov.transfer(admin.get_public_key().get_rev_address(), new1.get_public_key().get_rev_address(), funds, admin)
print("Fund:    ", result[0], " => ", result[1])
assert result[0]

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == funds

funds = funds - 100000000
result = rgov.transfer(new1.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), funds, new1)
print("refund:  ", result[0], " => ", result[1])
assert result[0]

# Can't put it all back due to gas fees
balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance < 100000000

result = rgov.transfer(new1.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), 100000000, new1)
print("too much:", result[0], "=> ", result[1])
assert result[0] == False

result = rgov.transfer(new1.get_public_key().get_rev_address(), "111111177777", 1000, new1)
print("Bad REV: ", result[0], "=> ", result[1])
assert result[0] == False
