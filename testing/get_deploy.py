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

deploy = '304502210092e9907119f19d0b3be0f8ba8c55a4483219766dbf317b1054917ce020be402c0220152db98864019237d648099cf8db2f0ac0b308eb94716ebad980df917620db9f'

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
status = [False, "no Votes found"]
name = "unknown"
tally = {}
for Bdata in result.blockInfo[0].postBlockData:
    if len(Bdata.exprs) > 0:
        if Bdata.exprs[0].HasField("e_list_body"):
            if len(Bdata.exprs[0].e_list_body.ps) > 0:
                for ps in Bdata.exprs[0].e_list_body.ps:
                    if ps.exprs[0].HasField("e_map_body"):
                        for kvs in ps.exprs[0].e_map_body.kvs:
                            tally[kvs.key.exprs[0].g_string] = kvs.value.exprs[0].g_int
                    if ps.exprs[0].HasField("g_string"):
                        name = ps.exprs[0].g_string
                status = [True, [name, tally]]
#            print("body", len(post.exprs[0].e_tuple_body.ps))
#            print("ps[0]", post.exprs[0].e_tuple_body.ps[0])
#            print("ps[1]", post.exprs[0].e_tuple_body.ps[1])
#            print("ps[2]", post.exprs[0].e_tuple_body.ps[2])
#            status = [True, [post.exprs[0].e_tuple_body.ps[1].exprs[0].g_string, post.exprs[0].e_tuple_body.ps[2].exprs[0].g_uri]]
#            for kvs in post.exprs[0].e_map_body.kvs:
#                if kvs.key.exprs[0].HasField("g_string"):
#                    if kvs.key.exprs[0].g_string == "URI":
#                        status = [True, kvs.value.exprs[0].g_uri]
print(status)
rgov.close()
