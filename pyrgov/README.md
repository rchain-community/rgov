# RGOV Python Class Library

Any API added to the pyrgov python class should have a corresponding unit test added to the testing/unit_test directory using a logical name in the form test_xxx.py

## Class function requirements

Each public function should correspond to the invocation of a single rholang file.
The first two lines of each rholang file will contain a match statement to properly pass in the parameters.
Note that passing in any PowerBox URI (typically "rho:" prefix) use the backquote ` not " or '
Each function must return a list where the first entry is a boolean signalling success/failure of the execution.
If the function is returning False then the second item is a string describing the failure.
If the function is returning Ture then the following items in the list are function dependent
Each function added should also add a corresponding synopsis if the function at the end of this file.

## Dependencies

These scripts are written for python3
At present the class functions rely upon the rchain/pyrchain python library which is the library that is used to perform regression tests on rnode prior to any release.
see https://github.com/rchain/pyrchain

## Example Usage

from rchain.crypto import PrivateKey
from pyrgov.rgov import rgovAPI

rgov = rgovAPI('localhost')
new1 = PrivateKey.generate()
admin = rgov.get_private_key('bootstrap')

balance = rgov.checkBalance(new1.get_public_key().get_rev_address())
assert balance == 0

balance = rgov.checkBalance(admin.get_public_key().get_rev_address())
assert balance != 0
rgov.close()

### Notes:
- rchain/pyrchain and pyrgov need to be added to the PYTHONPATH environment variable
- rchain/pyrchain needs to be properly installed
- the rgov.close() may not be required since the class destructor does this automatically
- you should be able to have more than one rgov instance open, so closing can add clarity

# RGOV Class API synopsis

TODO