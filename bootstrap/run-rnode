#!/bin/bash

! cd "$(dirname "$0")" && echo "Could not cd to script directory" && exit 1

! ./stop-rnode && exit $?

private_key=$(cat PrivateKeys/pk.bootstrap)

mkdir -p log

rnode run -s \
   --validator-private-key "$private_key" \
   --dev-mode \
   -XX:MaxDirectMemorySize=100m -XX:MaxRAMPercentage=25 \
   > log/run-rnode.log 2>&1 &

tail -F log/run-rnode.log 2>/dev/null|sed -e '/Making a transition to Running state./q'

stty echo
