#!/usr/bin/python3

import time

from rchain.client import RClient
from rchain.crypto import PrivateKey
from rchain.util import create_deploy_data

from pyrgov.rgov import rgovAPI

RCHAIN_SERVER = ['localhost', 'rhobot', 'testnet', 'demo', 'mainnet']

TRANSFER_PHLO_LIMIT = 10000000
TRANSFER_PHLO_PRICE = 1

admin = PrivateKey.from_hex('28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36')
alpha = PrivateKey.from_hex('7139b72b9939334ff76e1479072c0558dca2c3620971c2bb233a7b25a690d610')
bravo = PrivateKey.from_hex('dd0dd23cd51460e6c42a154623df19372be332f0a61a51755603ab897f6ede39')
charlie = PrivateKey.from_hex('79cf7604de08deee525ac9f500e118eef6036c56b175adf5afac94bb9542c5c1')

def print_balances(rgov: rgovAPI):
    # get balance of vault
    admin_balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
    print("admin Balance ", admin_balance, " REV ", admin.get_public_key().get_rev_address())
    bravo_balance = rgov.checkBalance(bravo.get_public_key().get_rev_address())
    print("bravo Balance ", bravo_balance, " REV ", bravo.get_public_key().get_rev_address())


rgov = rgovAPI(RCHAIN_SERVER[0])

result = rgov.newInbox(alpha)
print(result)
result = rgov.newInbox(bravo)
print(result)
result = rgov.newInbox(charlie)
print(result)
result = rgov.newIssue(alpha, "inbox", "lunch", ["pizza", "tacos", "salad"])
print(result)

alphaURI = rgov.peekInbox(alpha, "inbox", "", "")
bravoURI = rgov.peekInbox(bravo, "inbox", "", "")
charlieURI = rgov.peekInbox(charlie, "inbox", "", "")
result = rgov.addVoterToIssue(alpha, "inbox", bravoURI, "lunch")
print(result)
result = rgov.addVoterToIssue(alpha, "inbox", charlieURI, "lunch")
print(result)

rgov.castVote(bravo, "inbox", "lunch", "pizza")
result = rgov.tallyVotes(bravo, "inbox", "lunch")

result = rgov.delegateVote(alpha, "inbox", "lunch", charlieURI)
print(result)

rgov.castVote(charlie, "inbox", "lunch", "salad")
result = rgov.tallyVotes(charlie, "inbox", "lunch")

rgov.castVote(alpha, "inbox", "lunch", "pizza")
result = rgov.tallyVotes(alpha, "inbox", "lunch")

result = rgov.tallyVotes(alpha, "inbox", "lunch")
print(result)

rgov.close()
