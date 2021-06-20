# Testing Directory

This directory should contain any integration tests or demo tests that may be of general interest.
It may be desirable to have some of the tests run on publically known REV Addresses.

## Script requirements

Each test script must be self contained and can only rely upon the 'admin' account containing sufficient REV all testing needs

The admin account and others are created based on the bootstrap/PrivateKeys directory

## Dependencies

These scripts are written for python3
These scripts should utilize the rgov/pyrgov class library to the greatest extent possible

The testing needs the 'pytest' command which can be installed with pip3

pip3 install -U pytest

The pytest command can be invoked from within the unit_test directory to run all tests
You may also run one test by running
pytest test_example.py
or
./test_example.py

It is important to note that the tests are not run in any specific order, which enforces the requirement that each test is fully self-contained
