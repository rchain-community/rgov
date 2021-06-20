#!/usr/bin/python

import time

from rchain.client import RClient
from rchain.crypto import PrivateKey

from pyrgov.rgov import rgovAPI

RCHAIN_SERVER = ['localhost', 'rhobot']

admin = PrivateKey.from_hex('28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36')
alpha = PrivateKey.from_hex('7139b72b9939334ff76e1479072c0558dca2c3620971c2bb233a7b25a690d610')
bravo = PrivateKey.from_hex('dd0dd23cd51460e6c42a154623df19372be332f0a61a51755603ab897f6ede39')
#alpha = PrivateKey.generate()
#bravo = PrivateKey.generate()
charlie = PrivateKey.generate()

def print_balances(rgov: rgovAPI):
    # get balance of vault
    admin_balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
    print("admin Balance ", admin_balance, " REV ", admin.get_public_key().get_rev_address())
    charlie_balance = rgov.checkBalance(charlie.get_public_key().get_rev_address())
    print("charlie Balance ", charlie_balance, " REV ", charlie.get_public_key().get_rev_address())


rgov = rgovAPI(RCHAIN_SERVER[0])
balance = rgov.checkBalance(charlie.get_public_key().get_rev_address())
if balance < 100000000:
    result = rgov.transfer(admin.get_public_key().get_rev_address(), charlie.get_public_key().get_rev_address(), 100000000, admin)

#time.sleep(1)
#rgov.propose()
#time.sleep(1)
inbox = rgov.newInbox(charlie)
print('Charlie Inbox', inbox)
rgov.close()
