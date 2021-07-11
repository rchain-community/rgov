#!/usr/bin/python3

from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = rgov.get_private_key('anonymous')
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

funds = 100000000
result = rgov.transfer(admin.get_public_key().get_rev_address(), new1.get_public_key().get_rev_address(), funds, admin)
print("Fund:    ", result[0], " => ", result[1])
assert result[0]

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == funds

uri = "rho:id:doesnotexistxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
result = rgov.lookupURI(new1, uri)
assert not result[0]

value = "Hello World"
result = rgov.createURI(new1, value)
assert result[0]
uri = result[1]

result = rgov.lookupURI(new1, uri)
assert result[0]
assert result[1] == value

value = "2+2"
result = rgov.createURI(new1, value)
assert result[0]
uri = result[1]

result = rgov.lookupURI(new1, uri)
print(result)
assert result[0]
assert result[1] == value
