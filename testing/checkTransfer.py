#!/usr/bin/python

import time

from rchain.client import RClient
from rchain.crypto import PrivateKey
#from rchain.vault import VaultAPI
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
    alpha_balance = rgov.checkBalance(alpha.get_public_key().get_rev_address())
    print("alpha Balance ", alpha_balance, " REV ", alpha.get_public_key().get_rev_address())
    bravo_balance = rgov.checkBalance(bravo.get_public_key().get_rev_address())
    print("bravo Balance ", bravo_balance, " REV ", bravo.get_public_key().get_rev_address())
    charlie_balance = rgov.checkBalance(charlie.get_public_key().get_rev_address())
    print("charlie Balance ", charlie_balance, " REV ", charlie.get_public_key().get_rev_address())


rgov = rgovAPI(RCHAIN_SERVER[0])
#	block = client.propose()
#	print("propose ", block)
#	final = client.is_finalized(block)
#	print("is final ", final)
print_balances(rgov)
from_rev = admin.get_public_key().get_rev_address()
to_rev = bravo.get_public_key().get_rev_address()
result = rgov.transfer(from_rev, to_rev, 100000000000, admin)
print("rgov.transfer ", result);
time.sleep(1)
rgov.propose()
time.sleep(1)
print_balances(rgov)
rgov.close()
