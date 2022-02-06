#!/bin/bash

# shellcheck disable=SC2009
ALREADY=$(ps aux |grep -v grep | grep "java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2)

[ -n "$ALREADY" ] && echo "
$0: rnode is currently running. Use 'kill $ALREADY' to fix.
" && while read -r -p "Execute 'kill $ALREADY' [y]? " response;do
	if [ "$response" == "y" ] || [ -z "$response" ];then
		kill "$ALREADY"
		break
	else
		echo "Aborting $0"
		exit 1
	fi
done

exit 0
