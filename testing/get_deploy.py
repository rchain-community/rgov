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

deploy = '3045022100954641415fe856dac335eac3cebb6de2f8a4fd2bb16c4f13d9c23c85ddd0d983022051145c935616cd7c5c9db65f9031ec2cdfe5963a6cd8b2d019fd343ae719bab5'

def print_balances(rgov: rgovAPI):
    # get balance of vault
    admin_balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
    print("admin Balance ", admin_balance, " REV ", admin.get_public_key().get_rev_address())
    charlie_balance = rgov.checkBalance(charlie.get_public_key().get_rev_address())
    print("charlie Balance ", charlie_balance, " REV ", charlie.get_public_key().get_rev_address())

def parse(result):
        if result is None:
            return [False, "no deploy data"]
        msg = "No status messages found"
        status = False
        if (len(result.blockInfo[0].postBlockData) > 0):
            for post in result.blockInfo[0].postBlockData:
                if post.exprs[0].HasField("g_string"):
                    if status:
                        msg = msg + " " + post.exprs[0].g_string
                    else:
                        msg = post.exprs[0].g_string
        return [status, msg, result]

rgov = rgovAPI(RCHAIN_SERVER[0])
result = rgov.client.get_data_at_deploy_id(deploy, 5)
#result = result.blockInfo[0].postBlockData[0].exprs[0].e_list_body
print(result)
status = [False, "URI Not found"]
for post in result.blockInfo[0].postBlockData:
    if len(post.exprs) > 0:
        if post.exprs[0].HasField("e_map_body"):
            for kvs in post.exprs[0].e_map_body.kvs:
                if kvs.key.exprs[0].HasField("g_string"):
                    if kvs.key.exprs[0].g_string == "URI":
                        status = [True, kvs.value.exprs[0].g_uri]
print(status)
rgov.close()
