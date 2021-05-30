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

deploy = '3044022078cd3d052837a813e7d2b79360c03ab3d4232340431e9dc737558da1baa8f04602201e989c496eea3811c45333b6d383bc39e17d09066725075f4f22b74ed9514ca0'

def print_balances(rgov: rgovAPI):
    # get balance of vault
    admin_balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
    print("admin Balance ", admin_balance, " REV ", admin.get_public_key().get_rev_address())
    charlie_balance = rgov.checkBalance(charlie.get_public_key().get_rev_address())
    print("charlie Balance ", charlie_balance, " REV ", charlie.get_public_key().get_rev_address())


rgov = rgovAPI(RCHAIN_SERVER[0])
result = rgov.client.get_data_at_deploy_id(deploy, 5)
#result = result.blockInfo[0].postBlockData[0].exprs[0].e_list_body
print(result)
#print(dir(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body))
print(result.blockInfo[0].postBlockData[0].exprs[0].HasField("e_list_body"))
result = result.blockInfo[0].postBlockData[0].exprs[0].e_map_body
#print(result)
print(result.kvs[0])
#print(result.kvs[0]{"unknown proposal"})
#print(result.kvs[1]{"valid proposals"})
 #print(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[0].exprs[0].g_string)
#if len(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps) > 1:
#    if len(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[1].exprs) > 0:
#        print(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[1].exprs[0].g_string)
#print(result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps[0].exprs[0].g_string)
#print(result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps[1].exprs[0].g_string)
#print(result.ps[0].exprs[0].g_string)
#print(result.ps[1].exprs[0].g_string)
#print(result.ps[2].exprs[0].g_uri)
#print(dir(result))
#print(len(result))
##print(result.blockInfo[0].postBlockData[1].exprs[0].e_map_body.kvs[0].value.exprs[0].g_uri)
##print(dir(result.blockInfo[0].postBlockData[1].exprs[0].e_map_body.kvs[0].value.exprs[0].g_uri))

#result = rgov.getDeployData(deploy)
#print(result)
#print(result['exprs'])
#print(dir(result['exprs']))
rgov.close()
