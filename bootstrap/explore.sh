#!/bin/bash

for t in "$@";do
TMP=/tmp/$(basename "$t")
# shellcheck disable=SC2016
sed 's/(`rho:rchain:deployId`)//g
   s/(`rho:rchain:deployerId`)//g
   s,//.*, ,
   ' < "$t" > "$TMP"

curl -d @"$TMP" http://localhost:40403/api/explore-deploy 2>&1
done
echo
