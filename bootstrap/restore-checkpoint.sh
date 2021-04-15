#!/bin/bash

[ -z "$1" ] && echo "Please specify checkpoint name" && exit 1

ALREADY=`ps -fu |grep -v grep |grep " java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`

[ -n "$ALREADY" ] && echo "
$0: rnode is currently running
Use 'kill $ALREADY' to fix.
" && while read -p "Execute 'kill $ALREADY' [y]? " response;do
	if [ "$response" == "y" ] || [ -z "$response" ];then
      set -x
		kill $ALREADY
      set +x
		break
	else
		echo "Aborting $0"
		exit 1
	fi
done

[ -d ~/.rnode ] && echo "$HOME/.rnode exists" && while read -p "Replace [y]? " response;do
   if [ "$response" != 'y' ] && [ -n "$response" ];then
      echo "Aborted" && exit 0
   else
      break;
   fi
done

cd `dirname $0`

TARGET=$PWD/checkpoint/$1.tgz

if [ -f $TARGET ];then
   (cd ~; tar xzf $TARGET) && echo "Checkpoint restored: $TARGET"
else
   echo "Checkpoint not found: $TARGET"
fi
