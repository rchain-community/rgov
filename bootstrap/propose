#!/bin/bash

ME=$(basename "$0")
! cd "$(dirname "$0")" && echo "$ME: Could not cd to script directory" && exit 1

mkdir -p log

echo "$ME: proposing..."
rnode --grpc-port 40402 propose 2>&1 |
	tail -n 0 -F log/run-rnode.log |
	sed -e '/Blocks ready to be added/q;/Error while creating block: NoNewDeploys/q;/^[0-9][0-9]:[0-9][0-9]:[0-9]/d' |sed -e "s/^/$ME: /"
