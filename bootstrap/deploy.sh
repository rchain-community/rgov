#!/bin/bash

CURPWD="$PWD"

# Find out my name
ME=$(basename "$0")

# Change directory to wherever I'm located
! cd "$(dirname "$0")" && echo "$ME: Could not cd to script directory" && exit 1

# Check for a running rnode
! ./check-rnode && exit $?

# Check to see if the user wants an error file
errorfile=""
if [ "$1" = "--error" ]; then
   errorfile=$2;
   shift 2;
fi

# Get the bootstrap private key
private_key=$(cat PrivateKeys/pk.bootstrap)

# Double check that we're still in an existing directory
! cd "$CURPWD" && echo "$ME: Current directory no longer exists" && exit 1

# Get the last block in the rnode
lastblock=$(curl -s 'http://localhost:40403/api/blocks/1'|jq '.[].blockNumber')

# Go through all the files the user gave us and do an rnode deploy
for t in "$@";do
   # Tell the user what file we're processing
   echo "$ME: Deploying $t after block ${lastblock:-0}"

   # deploy the file to rnode
   rnode deploy \
   --valid-after-block-number "${lastblock:-0}" \
   --phlo-price 1 \
   --phlo-limit 100000000 \
   --private-key "$private_key" \
   "$t"

   # Find out if we were successful
   status=$?
   if [ $status -ne 0 ] ; then
      echo "$0 status $status"
      if [[ -n "$errorfile" ]]; then
         echo "$ME: error $status for $t" >>"$errorfile"
      fi
      break;
   fi
done 2>&1

# non-zero on failure
exit $status
