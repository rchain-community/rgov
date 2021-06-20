# Unit Test Directory

Any API added to the pyrgov python class should have a corresponding test_xxx.py
script added here to perform unit testing.

## Script requirements

Each test script must be self contained
Each test may rely upon the 'admin' REV address to contain sufficient REV all testing needs
Each test must not rely upon any other known or preexisting REV addresses

The admin account and others are created based on the bootstrap/PrivateKeys directory

## Dependencies

These scripts are written for python3
These scripts should utilize the rgov/pyrgov class library to the greatest extent possible

The testing needs the 'pytest' command which can be installed with pip3

pip3 install -U pytest

The pytest command can be invoked from within the testing directory to run all tests, including unit tests.
You may also run one test by running
pytest test_example.py
or
./test_example.py

It is important to note that the tests are not run in any specific order, which enforces the requirement that each test is fully self-contained
