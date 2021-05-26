#!/usr/bin/python

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
undefined = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(undefined.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0