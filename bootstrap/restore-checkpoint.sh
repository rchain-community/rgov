#!/bin/bash

[ -z "$1" ] && echo "Please specify checkpoint name" && exit 1

[ -d ~/.rnode ] && echo "$HOME/.rnode exists" && while read -p "Replace [y]? " response;do
   if [ "$response" != 'y' ] && [ -n "$response" ];then
      echo "Aborted" && exit 0
   else
      break;
   fi
done

cd `dirname $0`

./stop-rnode
if [ $? -ne 0 ] ; then exit $?; fi

TARGET=$PWD/checkpoint/$1.tgz

if [ -f $TARGET ];then
   (cd ~; tar xzf $TARGET) && echo "Checkpoint restored: $TARGET"
else
   echo "Checkpoint not found: $TARGET"
fi
