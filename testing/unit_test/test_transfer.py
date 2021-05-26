#!/usr/bin/python

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
undefined = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0

balance = rgov.checkBalance(undefined.get_public_key().get_rev_address())
assert balance == 0

funds = 12300000000
result = rgov.transfer(admin.get_public_key().get_rev_address(), undefined.get_public_key().get_rev_address(), funds, admin)
print("fund", result.BlockInfo.postBlockData)
print("bool", result.exprs[0].e_tuple_body.ps[0].exprs.g_bool)
print("string", result.exprs[0].e_tuple_body.ps[0].exprs.g_string)

balance = rgov.checkBalance(undefined.get_public_key().get_rev_address())
assert balance == funds

funds = funds - 100000000
result = rgov.transfer(undefined.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), funds, undefined)
print("refund", result)

# Can't put it all back due to gas fees
balance = rgov.checkBalance(undefined.get_public_key().get_rev_address())
assert balance < 100000000

result = rgov.transfer(undefined.get_public_key().get_rev_address(), admin.get_public_key().get_rev_address(), 100000000, undefined)
print("can't fund", result)

assert 0