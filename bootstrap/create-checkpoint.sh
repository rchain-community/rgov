#!/bin/bash

[ -z "$1" ] && echo "Please specify checkpoint name" && exit 1

[ ! -d ~/.rnode ] && echo "$HOME/.rnode does not exist for checkpointing" && exit 2

cd `dirname $0`

mkdir -p checkpoint

TARGET=$PWD/checkpoint/$1.tgz

[ -f $TARGET ] && while read -p "$TARGET already exists. Replace [y]? " response;do
   if [ "$response" != 'y' ] && [ -n "$response" ]; then
      echo "Aborted"
      exit 0
   else
      break
   fi
done

(cd ~; tar czf $TARGET .rnode)
echo "Checkpoint created: $TARGET"
