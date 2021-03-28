#!/bin/bash

echo "$0 is a work in progress. Exiting." && exit 1

ALREADY=`ps a |grep rnode|grep -v grep |sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 1`
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
		echo "exiting"
		exit 1
	fi
done

[ ! -d ~/.rnode ] && echo "
$0: $HOME/.rnode does not exist
Use 'bootstrap' to fix.
" && exit 1

CLASS=`basename $1`
LOGFILE=deploy-one.$CLASS.log

DEPLOY="./deploy"
PROPOSE="./propose"

set -x

cd `dirname $0`

private_key=`cat bootstrap.private-key`

rnode run -s \
   --validator-private-key $private_key \
   --dev-mode \
   -XX:MaxDirectMemorySize=100m -XX:MaxRAMPercentage=25 \
   > $LOGFILE 2>&1 &

set +x

PID=$!

# The previous command doesn't produce output -- but this makes up for that
tail -f $LOGFILE|sed -e '/Making a transition to Running state./q'

$DEPLOY $1 |tee -a $LOGFILE

# Finalize the rnode
echo "Proposing...." |tee -a $LOGFILE
$PROPOSE 2>&1|tee -a $LOGFILE | while read t;do
   echo -n '.'
   sleep 1
done
echo "Propose finished." |tee -a $LOGFILE

echo "Generating master directory update."
cat - > generated.deploy-one-$CLASS-update-directory.rho << EOF
new stdout(\`rho:io:stdout\`), deployerId(\`rho:rchain:deployerId\`) in {
for(@{"write": *write, ..._} <<- @[*deployerId, "MasterContractAdmin"]) {
   stdout!(["write", *write]) |
   write!("$CLASS", *ch)
}}
EOF

echo "Proposing master directory update...." |tee -a $LOGFILE
$PROPOSE 2>&1|tee -a $LOGFILE

echo "Stopping deployment rnode"
kill $PID
