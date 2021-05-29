import string
import time
import requests
import glob
from typing import Mapping

from types import TracebackType
from typing import Iterable, List, Optional, Tuple, Type, TypeVar, Union

from rchain.client import RClient
from rchain.pb.RhoTypes_pb2 import DeployId
#from rchain.util import create_deploy_data
from rchain.crypto import PrivateKey

import pathlib
BASEPATH = str(pathlib.Path(__file__).parent.absolute())

# these are predefined param
TRANSFER_PHLO_LIMIT = 1000000
TRANSFER_PHLO_PRICE = 1

PRIVATE_KEYS = BASEPATH + '/../bootstrap/PrivateKeys/'
CHECK_BALANCE_RHO_TPL = BASEPATH + '/../src/actions/checkBalance.rho'
TRANSFER_RHO_TPL = BASEPATH + '/../src/actions/transfer.rho'
NEWINBOX_RHO_TPL = BASEPATH + '/../src/actions/newinbox.rho'
NEWISSUE_RHO_TPL = BASEPATH + '/../src/actions/newIssue.rho'
ADDVOTER_RHO_TPL = BASEPATH + '/../src/actions/addVoterToIssue.rho'
PEEKINBOX_RHO_TPL = BASEPATH + '/../src/actions/peekInbox.rho'
CASTVOTE_RHO_TPL = BASEPATH + '/../src/actions/castVote.rho'
DELEGATEVOTE_RHO_TPL = BASEPATH + '/../src/actions/delegateVote.rho'
TALLYVOTES_RHO_TPL = BASEPATH + '/../src/actions/tallyVotes.rho'

MASTERURI = BASEPATH + '/../src/MasterURI.'

LOCALHOST = {
    'observerBase': {'url': 'http://', 'host': 'localhost', 'port': 40402},
    'validatorBase': {'url': 'http://', 'host': 'localhost', 'port': 40403, 'num': 1},
    'adminBase': {'url': 'http://', 'host': 'localhost', 'port': 40405}
}
TESTNET = {
    'observerBase': {'url': 'https://', 'host': 'observer.testnet.rchain.coop', 'port': 443},
    'validatorBase': {'url': 'https://', 'host': 'node1.testnet.rchain-dev.tk', 'port': 443, 'num': 1},
    'adminBase': {'url': '', 'host': '', 'port': 0}
}
DEMONET = {
    'observerBase': {'url': 'https://', 'host': 'demoapi.rhobot.net', 'port': 443},
    'validatorBase': {'url': 'https://', 'host': 'demoapi.rhobot.net', 'port': 443, 'num': 1},
    'adminBase': {'url': 'https://', 'host': 'demoadmin.rhobot.net', 'port': 443}
}
RHOBOTNET = {
    'observerBase': {'url': 'https://', 'host': 'rnodeapi.rhobot.net', 'port': 443},
    'validatorBase': {'url': 'https://', 'host': 'rnodeapi.rhobot.net', 'port': 443, 'num': 1},
    'adminBase': {'url': 'https://', 'host': 'rnodeadmin.rhobot.net', 'port': 443}
}
MAINNET = {
    'observerBase': {'url': 'https://', 'host': 'observer.services.mainnet.rchain.coop', 'port': 443},
    'validatorBase': {'url': 'https://', 'host': 'node12.root-shard.mainnet.rchain.coop', 'port': 443, 'num': 1},
    'adminBase': {'url': '', 'host': '', 'port': 0}
}

NETWORKS = {
    'localhost': LOCALHOST,
    'testnet': TESTNET,
    'demonet': DEMONET,
    'rhobot': RHOBOTNET,
    'mainnet': MAINNET,
}

def render_contract_template(template_file: str, substitutions: Mapping[str, str]) -> str:
    file = open(template_file)
    template = file.read()
    file.close()
    return string.Template(template).substitute(substitutions)

class rgovAPI:

    def __init__(self, net_name: str):
        if net_name in NETWORKS:
            #print('Using ', net_name)
            network = NETWORKS[net_name]
            self.client = RClient(network['observerBase']['host'], network['observerBase']['port'])
            self.network = network
            self.net_name = net_name
            self.keyVault = self.import_shared_private_keys()
        else:
            reason = 'Network ' + net_name + ' NOT Found as an option'
            raise Exception(reason)

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> 'rgovAPI':
        return self

    def __exit__(self, exc_type: Optional[Type[BaseException]],
                 exc_val: Optional[BaseException],
                 exc_tb: Optional[TracebackType]) -> None:
        self.close()

    def import_shared_private_keys(self) -> Mapping[str, str]:
        search = PRIVATE_KEYS + "pk.*"
        keys = {}
        for fname in glob.glob(search):
            name = fname.split("/")[-1]
            names = name.split(".")
            if len(names) == 2:
                file = open(fname)
                pk = file.read()
                file.close()
                keys[names[1]] = pk
        return keys

    def get_private_key(self, name: str) -> PrivateKey:
        if name in self.keyVault:
            return PrivateKey.from_hex(self.keyVault[name])
        reason = 'No key found in vault for ' + name
        raise Exception(reason)

    def getDeploy(self, deployId: str, tries: int=10):
        print("getBlock ", self.network['validatorBase']['host'])
        url = self.network['validatorBase']['url'] + self.network['validatorBase']['host']
        if self.network['validatorBase']['port'] > 0:
            url += ':' + str(self.network['validatorBase']['port'])

        url += '/api/deploy/' + deployId
        print("Get Deploy ", url)
        while tries > 0:
            result = requests.get(url)
            print("Got ", result)
            if result.status_code == 200:
                break
            tries = tries - 1
            time.sleep(1.0)
            print("Try again ", tries)
        print(result.json())
        return result.json()

    def getBlock(self, block_hash: str):
        print("getBlock ", self.network['validatorBase']['host'])
        url = self.network['validatorBase']['url'] + self.network['validatorBase']['host']
        if self.network['validatorBase']['port'] > 0:
            url += ':' + str(self.network['validatorBase']['port'])

        url += '/api/block/' + block_hash
        print("Get Block ", url)
        result = requests.get(url)
        return result.json()

    def getDeployData(self, block_hash: str):
        #print("getDeployData ", self.network['validatorBase']['host'])
        url = self.network['validatorBase']['url'] + self.network['validatorBase']['host']
        if self.network['validatorBase']['port'] > 0:
            url += ':' + str(self.network['validatorBase']['port'])

        url += '/api/data-at-name'
        data = '{"depth": 1, "name": {"UnforgDeploy": {"data": "'+block_hash+'"}}}'
        #print("Post ", url, data)
        headers = {'Content-type': 'text/plain', 'Accept': '*/*'}
        result = requests.post(url, data, headers=headers)
        return result.json()

    def propose(self) -> None:
        if self.network['adminBase']['url']:
            url = self.network['adminBase']['url'] + self.network['adminBase']['host']
            if self.network['adminBase']['port'] > 0:
                url += ':' + str(self.network['adminBase']['port'])

            url += '/api/propose'
            time.sleep(0.5)
            result = requests.post(url)
            return result.json()

    def checkBalance(self, rev_addr: str, block_hash: str='') -> int:
        contract = render_contract_template(
            CHECK_BALANCE_RHO_TPL,
            {'addr': rev_addr, 'myBalance': "mybal"},
        )
        result = self.client.exploratory_deploy(contract, block_hash)
        return result[0].exprs[0].e_list_body.ps[2].exprs[0].g_int

    def transfer(self, from_addr: str, to_addr: str, amount: int, key: PrivateKey) -> str:
        contract = render_contract_template(
            TRANSFER_RHO_TPL,
            {'from': from_addr, 'to': to_addr, 'amount': amount},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        #print("transfer ", deployId)
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId, 5)
        result = result.blockInfo[0].postBlockData[0].exprs[0].e_tuple_body
        status = result.ps[0].exprs[0].g_bool
        msg = result.ps[1].exprs[0].g_string
        return [status, msg]

    def newInbox(self, key: PrivateKey) -> str:
        fname = MASTERURI + self.net_name + '.json'
        file = open(fname)
        masterstr = file.read()
        file.close()
        start = masterstr.find('rho:id:')
        end = masterstr.find('`', start)
        if start < 0 or end < 0:
            raise Exception("masterURI file corrupt")

        masterURI = masterstr[start:end]
        print('MasterURI: ', masterURI)
        contract = render_contract_template(
            NEWINBOX_RHO_TPL,
            {'masterURI': masterURI, 'inbox': 'inboxURI'},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("newInbox ", deployId)
        result = self.propose()
        print("Propose ", result)
        result = self.client.get_data_at_deploy_id(deployId, 5)
        result = result.blockInfo[0].postBlockData[0].exprs[0].e_list_body
        return [result.ps[0].exprs[0].g_string, result.ps[1].exprs[0].g_string, result.ps[2].exprs[0].g_uri]

    def newIssue(self, key: PrivateKey, inbox: str, issue: str, options: list) -> str:
        if len(options) < 2:
            raise Exception("newIssue: options must have at least 2 choices")

        choices = '"' + '", "'.join(options) + '"'
        contract = render_contract_template(
            NEWISSUE_RHO_TPL,
            {'inboxURI': inbox, 'issue': issue, 'choices': choices},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("newIssue ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId, 5)
        return result

    def addVoterToIssue(self, key: PrivateKey, locker: str, voter: str, issue: str) -> str:
        contract = render_contract_template(
            ADDVOTER_RHO_TPL,
            {'inbox': locker, 'voterURI': voter, 'issue': issue},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("addVoterToIssue ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId)
        return result

    def peekInbox(self, key: PrivateKey, inbox: str, type: str, subtype: str):
        contract = render_contract_template(
            PEEKINBOX_RHO_TPL,
            {'inbox': inbox, 'type': type, 'subtype': subtype},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("peekInbox ", deployId);
        self.propose()
        result = self.getDeployData(deployId)
        if result["length"] == 0:
            return ""
        if result["length"] == 1:
            if "ExprMap" in result["exprs"][0]["expr"]:
                return result["exprs"][0]["expr"]["ExprMap"]['data']['URI']['ExprUri']['data']

        if "ExprMap" in result["exprs"][0]["expr"]["ExprPar"]["data"][0]:
            return result["exprs"][0]["expr"]["ExprPar"]["data"][0]["ExprMap"]['data']['URI']['ExprUri']['data']
        if "ExprMap" in result["exprs"][0]["expr"]["ExprPar"]["data"][1]:
            return result["exprs"][0]["expr"]["ExprPar"]["data"][1]["ExprMap"]['data']['URI']['ExprUri']['data']
        return ""
        #result = self.client.get_data_at_deploy_id(deployId, 5)
#        if result.length == 0:
#            return ""
#        print(result.blockInfo[0].postBlockData)
#        print(len(result.blockInfo[0].postBlockData))
#        print("postBlockData[0] Type ", len(result.blockInfo[0].postBlockData[0].exprs))
#        print("postBlockData[0]", result.blockInfo[0].postBlockData[0].exprs[0])
#        print("postBlockData[1] Type ", len(result.blockInfo[0].postBlockData[1].exprs))
#        print("postBlockData[1]", result.blockInfo[0].postBlockData[1].exprs)
#        if result.blockInfo[0].postBlockData[0].exprs[0].e_map_body != "":
#            print("e_map_body0", result.blockInfo[0].postBlockData[0].exprs[0].e_map_body.kvs[0].value.exprs[0].g_uri)
#        if result.blockInfo[0].postBlockData[1].exprs[0].e_map_body != "":
#            print("e_map_body1", result.blockInfo[0].postBlockData[1].exprs[0].e_map_body.kvs[0].value.exprs[0].g_uri)
#        return result.blockInfo[0].postBlockData[1].exprs[0].e_map_body.kvs[0].value.exprs[0].g_uri

    def castVote(self, key: PrivateKey, inbox: str, issue: str, choice: str):
        contract = render_contract_template(
            CASTVOTE_RHO_TPL,
            {'inbox': inbox, 'issue': issue, 'choice': choice},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("castVote ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId)
        oldvote = ""
        newvote = ""
        if result.blockInfo[0].postBlockData[0].exprs[0].HasField("e_list_body"):
            if result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[0].exprs[0].g_string == "oldvote was":
                if len(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps) > 1:
                    if len(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[1].exprs) > 0:
                        oldvote = result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[1].exprs[0].g_string
                if len(result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps) > 1:
                    if len(result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps[1].exprs) > 0:
                        newvote = result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps[1].exprs[0].g_string
            else:
                if len(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps) > 1:
                    if len(result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[1].exprs) > 0:
                        newvote = result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps[1].exprs[0].g_string
                if len(result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps) > 1:
                    if len(result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps[1].exprs) > 0:
                        oldvote = result.blockInfo[0].postBlockData[1].exprs[0].e_list_body.ps[1].exprs[0].g_string
            return [True, [oldvote, newvote]]
        if result.blockInfo[0].postBlockData[0].exprs[0].HasField("e_map_body"):
            result = result.blockInfo[0].postBlockData[0].exprs[0].e_map_body
            return [False, result]
        return [False, ]

    def delegateVote(self, key: PrivateKey, inbox: str, issue: str, delegate: str) -> str:
        contract = render_contract_template(
            DELEGATEVOTE_RHO_TPL,
            {'inbox': inbox, 'issue': issue, 'delegate': delegate},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("delegateVote ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId)
        return result

    def tallyVotes(self, key: PrivateKey, inbox: str, issue: str) -> str:
        contract = render_contract_template(
            TALLYVOTES_RHO_TPL,
            {'inbox': inbox, 'issue': issue},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("tallyVotes ", deployId);
        #result = self.client.get_data_at_deploy_id(deployId)
        self.propose()
        result = self.getDeployData(deployId)
        print(result)
        return result
