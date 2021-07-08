#!/usr/bin/python3

from pyrgov.rgov import rgovAPI
import pathlib

if __name__ != pathlib.Path(__file__).stem and __name__ != '__main__':
    assert False

rgov = rgovAPI('localhost')
new1 = rgov.get_private_key('anonymous')
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0