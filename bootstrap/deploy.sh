#!/bin/bash

private_key=`cat bootstrap.private-key`

for t in $@;do
   echo "Deploying $t"
   rnode deploy \
   --valid-after-block-number 0 \
   --phlo-price 1 \
   --phlo-limit 10000000 \
   --private-key $private_key \
   $t
done 2>&1
