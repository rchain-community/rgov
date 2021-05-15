import string
import time
import requests
from typing import Mapping

from types import TracebackType
from typing import Iterable, List, Optional, Tuple, Type, TypeVar, Union

from rchain.client import RClient
from rchain.util import create_deploy_data
from rchain.crypto import PrivateKey

# these are predefined param
TRANSFER_PHLO_LIMIT = 1000000
TRANSFER_PHLO_PRICE = 1

CHECK_BALANCE_RHO_TPL = '../src/actions/checkBalance.rho'
TRANSFER_RHO_TPL = '../src/actions/transfer.rho'

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
            print('Using ', net_name)
            network = NETWORKS[net_name]
            self.client = RClient(network['observerBase']['host'], network['observerBase']['port'])
            self.network = network
        else:
            reason = 'Network ' + network + ' NOT Found as an option'
            raise Exception(reason)

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> 'rgovAPI':
        return self

    def __exit__(self, exc_type: Optional[Type[BaseException]],
                 exc_val: Optional[BaseException],
                 exc_tb: Optional[TracebackType]) -> None:
        self.close()

    def propose(self) -> None:
        if self.network['adminBase']['url']:
            url = self.network['adminBase']['url'] + self.network['adminBase']['host']
            if self.network['adminBase']['port'] > 0:
                url += ':' + str(self.network['adminBase']['port'])

            url += '/api/propose'
            result = requests.post(url)


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
        result = self.client.deploy_with_vabn_filled(key, contract, TRANSFER_PHLO_PRICE, TRANSFER_PHLO_LIMIT)
        print("transfer ", result);
        self.propose
        return result

