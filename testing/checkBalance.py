#!/usr/bin/python

from rchain.client import RClient
from rchain.crypto import PrivateKey
#from rchain.vault import VaultAPI
from pyrgov.rgov import rgovAPI

RCHAIN_SERVERS = ['localhost', 'rhobot']

admin = PrivateKey.from_hex('28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36')
alpha = PrivateKey.from_hex('7139b72b9939334ff76e1479072c0558dca2c3620971c2bb233a7b25a690d610')
bravo = PrivateKey.from_hex('dd0dd23cd51460e6c42a154623df19372be332f0a61a51755603ab897f6ede39')
charlie = PrivateKey.from_hex('79cf7604de08deee525ac9f500e118eef6036c56b175adf5afac94bb9542c5c1')
#alpha = PrivateKey.generate()
#bravo = PrivateKey.generate()
#charlie = PrivateKey.generate()

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

def add_funds(rgov: rgovAPI, key: PrivateKey, rev: int):
    one = 100000000
    bal = rgov.checkBalance(key.get_public_key().get_rev_address())
    if bal < one:
        rgov.transfer(admin.get_public_key().get_rev_address(), key.get_public_key().get_rev_address(), rev*one, admin)

rgov = rgovAPI('localhost')
print_balances(rgov)
add_funds(rgov, alpha, 1000)
add_funds(rgov, bravo, 1000)
add_funds(rgov, charlie, 1000)
print_balances(rgov)
