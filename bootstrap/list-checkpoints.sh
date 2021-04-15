#!/bin/bash

cd `dirname $0`

ls -1 checkpoint|sed 's/\.tgz$//'
