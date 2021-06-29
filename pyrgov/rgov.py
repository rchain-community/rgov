import string
import time
import requests
import glob
from typing import Mapping

from types import TracebackType
from typing import Iterable, List, Optional, Tuple, Type, TypeVar, Union

from rchain.client import RClient
from rchain.pb.RhoTypes_pb2 import DeployId
from rchain.crypto import PrivateKey

import pathlib
PYRGOV = pathlib.Path(__file__).parent.resolve()
BASEPATH = PYRGOV.parent

# these are predefined param
TRANSFER_PHLO_LIMIT = 1000000
TRANSFER_PHLO_PRICE = 1

PRIVATE_KEYS = BASEPATH.joinpath('bootstrap', 'PrivateKeys')
CHECK_BALANCE_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'checkBalance.rho')
TRANSFER_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'transfer.rho')
NEWINBOX_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'newinbox.rho')
NEWISSUE_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'newIssue.rho')
ADDVOTER_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'addVoterToIssue.rho')
PEEKINBOX_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'peekInbox.rho')
CASTVOTE_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'castVote.rho')
DELEGATEVOTE_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'delegateVote.rho')
TALLYVOTES_RHO_TPL = BASEPATH.joinpath('src', 'actions', 'tallyVotes.rho')

MASTERURI = BASEPATH.joinpath('src')

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

def render_contract_template(template_file: pathlib, substitutions: Mapping[str, str]) -> str:
    file = template_file.open()
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
        search = PRIVATE_KEYS
        keys = {}
        for fname in search.glob("pk.*"):
            name = fname.suffix[1:]
            file = fname.open()
            pk = file.read()
            file.close()
            keys[name] = pk
        return keys

    def get_private_key(self, name: str) -> PrivateKey:
        if name in self.keyVault:
            return PrivateKey.from_hex(self.keyVault[name])
        reason = 'No key found in vault for ' + name
        raise Exception(reason)

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
        fname = MASTERURI.joinpath('MasterURI.' + self.net_name + '.json')
        file = fname.open()
        masterstr = file.read()
        file.close()
        start = masterstr.find('rho:id:')
        end = masterstr.find('`', start)
        if start < 0 or end < 0:
            return [False, "masterURI file corrupt"]

        masterURI = masterstr[start:end]
        contract = render_contract_template(
            NEWINBOX_RHO_TPL,
            {'masterURI': masterURI},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("newInbox ", deployId)
        result = self.propose()
        result = self.client.get_data_at_deploy_id(deployId, 5)
        if result is None:
            return [False, "no deploy data"]
        if len(result.blockInfo) == 0:
            return [False, "no deploy data"]
        if (len(result.blockInfo[0].postBlockData)) == 0:
            return [False, "no deploy data"]

        status = [False, "URI not found"]
        if (len(result.blockInfo[0].postBlockData[0].exprs) > 0):
            if (result.blockInfo[0].postBlockData[0].exprs[0].HasField('e_list_body')):
                for data in result.blockInfo[0].postBlockData[0].exprs[0].e_list_body.ps:
                    if data.exprs[0].HasField("e_map_body"):
                        for kvs in data.exprs[0].e_map_body.kvs:
                            if kvs.key.exprs[0].g_string == "inbox":
                                if kvs.value.exprs[0].HasField("e_map_body"):
                                    for inbox in kvs.value.exprs[0].e_map_body.kvs:
                                        if inbox.key.exprs[0].g_string == "URI":
                                            status = [True, inbox.value.exprs[0].g_uri]

        return status

    def newIssue(self, key: PrivateKey, inbox: str, issue: str, options: list) -> str:
        if len(options) < 2:
            return [False, "newIssue: options must have at least 2 choices"]

        choices = '"' + '", "'.join(options) + '"'
        contract = render_contract_template(
            NEWISSUE_RHO_TPL,
            {'inbox': inbox, 'issue': issue, 'choices': choices},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("newIssue ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId, 5)
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
                    status = True
        return [status, msg, result]

    def addVoterToIssue(self, key: PrivateKey, locker: str, voter: str, issue: str) -> str:
        contract = render_contract_template(
            ADDVOTER_RHO_TPL,
            {'inbox': locker, 'voterURI': voter, 'issue': issue},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("addVoterToIssue ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId)
        if result is None:
            return [False, "no deploy data"]
        return [True, result]

    def peekInbox(self, key: PrivateKey, inbox: str, type: str, subtype: str):
        contract = render_contract_template(
            PEEKINBOX_RHO_TPL,
            {'inbox': inbox, 'type': type, 'subtype': subtype},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("peekInbox ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId, 5)
        if result is None:
            return [False, "no deploy data"]
        status = [False, "URI Not found"]
        if len(result.blockInfo) > 0:
            for post in result.blockInfo[0].postBlockData:
                if len(post.exprs) > 0:
                    if post.exprs[0].HasField("e_map_body"):
                        for kvs in post.exprs[0].e_map_body.kvs:
                            if kvs.key.exprs[0].HasField("g_string"):
                                if kvs.key.exprs[0].g_string == "URI":
                                    status = [True, kvs.value.exprs[0].g_uri]
        
        return status

    def castVote(self, key: PrivateKey, inbox: str, issue: str, choice: str):
        contract = render_contract_template(
            CASTVOTE_RHO_TPL,
            {'inbox': inbox, 'issue': issue, 'choice': choice},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("castVote ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId)
        if result is None:
            return [False, "no deploy data"]
        oldvote = ""
        newvote = ""
        badvote = ""
        choices = ""
        if len(result.blockInfo) == 1:
            for post in result.blockInfo[0].postBlockData:
                if post.exprs[0].HasField("e_list_body"):
                    if post.exprs[0].e_list_body.ps[0].exprs[0].g_string == "oldvote was":
                        if len(post.exprs[0].e_list_body.ps) > 1:
                            if len(post.exprs[0].e_list_body.ps[1].exprs) > 0:
                                oldvote = post.exprs[0].e_list_body.ps[1].exprs[0].g_string
                    if post.exprs[0].e_list_body.ps[0].exprs[0].g_string == "newvote is":
                        if len(post.exprs[0].e_list_body.ps) > 1:
                            if len(post.exprs[0].e_list_body.ps[1].exprs) > 0:
                                newvote = post.exprs[0].e_list_body.ps[1].exprs[0].g_string
                if post.exprs[0].HasField("e_map_body"):
                    for kvs in post.exprs[0].e_map_body.kvs:
                        if kvs.key.exprs[0].g_string == "unknown proposal":
                            badvote = kvs.value.exprs[0].g_string
                        if kvs.key.exprs[0].g_string == "valid proposals":
                            for proposals in kvs.value.exprs[0].e_set_body.ps:
                                if choices == "":
                                    choices = proposals.exprs[0].g_string
                                else:
                                    choices = choices + ", " + proposals.exprs[0].g_string
        if badvote != "":
            return [False, [badvote, choices]]
        else:
            return [True, [oldvote, newvote]]

    def delegateVote(self, key: PrivateKey, inbox: str, issue: str, delegate: str) -> str:
        contract = render_contract_template(
            DELEGATEVOTE_RHO_TPL,
            {'inbox': inbox, 'issue': issue, 'delegate': delegate},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("delegateVote ", deployId);
        self.propose()
        result = self.client.get_data_at_deploy_id(deployId)
        if result.length == 0:
            return [False, "No issue found"]
        status = [False, "URI Not found"]
        for post in result.blockInfo[0].postBlockData:
            if len(post.exprs) > 0:
                if post.exprs[0].HasField("e_tuple_body"):
                    body = post.exprs[0].e_tuple_body
                    status = [True, [body.ps[1].exprs[0].g_string, body.ps[2].exprs[0].g_uri]]
        return status

    def tallyVotes(self, key: PrivateKey, inbox: str, issue: str) -> str:
        contract = render_contract_template(
            TALLYVOTES_RHO_TPL,
            {'inbox': inbox, 'issue': issue},
        )
        deployId = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("tallyVotes ", deployId);
        self.propose()
        #result = self.getDeployData(deployId)
        result = self.client.get_data_at_deploy_id(deployId)
        if result.length == 0:
            return [False, "No issue found"]
        votes = {}
        found_counts = False
        found_done = False
        for BData in result.blockInfo[0].postBlockData:
            if len(BData.exprs) > 0:
                if BData.exprs[0].HasField("g_string"):
                    found_done = True
                if BData.exprs[0].HasField("e_list_body"):
                    for BList in BData.exprs[0].e_list_body.ps:
                        if BList.exprs[0].HasField("g_string"):
                            if BList.exprs[0].g_string == "counts":
                                found_counts = True
                        if BList.exprs[0].HasField("e_map_body"):
                            for voted in BList.exprs[0].e_map_body.kvs:
                                if voted.HasField("key"):
                                    choice = voted.key.exprs[0].g_string
                                else:
                                    choice = ""
                                votes[choice] = voted.value.exprs[0].g_int
        return [found_counts and found_done, votes]

