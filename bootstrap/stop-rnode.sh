#!/bin/bash

ALREADY=`ps a |grep -v grep |grep -v $0|grep rnode|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`

[ -n "$ALREADY" ] && echo "
$0: rnode is currently running. Use 'kill $ALREADY' to fix.
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
