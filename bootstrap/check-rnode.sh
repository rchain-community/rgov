#!/bin/bash

# shellcheck disable=SC2009
ALREADY=$(ps aux |grep -v grep | grep "java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2)

if [ -z "$ALREADY" ]; then
	echo "$0: rnode is NOT currently running. Run ./run-rnode to fix."
	exit 1;
fi

exit 0
