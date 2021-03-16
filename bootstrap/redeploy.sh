#!/bin/bash

ALREADY=`ps a |grep rnode|grep -v grep |sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 1`
[ -n "$ALREADY" ] && echo "
redeploy: rnode is currently running
Use 'kill $ALREADY' to fix.
" && while read -p "Execute 'kill $ALREADY' [n]? " response;do
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
Cannot redeploy: $HOME/.rnode does not exist
Use 'bootstrap' to fix.
" && exit 1

cd `dirname $0`

./list-checkpoints.sh|grep "liquid-democracy-base" && echo "checkpoint liquid-democracy-base already exists." && while read -p "Use it instead of re-running deploy [y]? " response;do
   if [ "$response" == 'y' ] || [ -z "$response" ];then
      ./restore-checkpoint.sh "liquid-democracy-base"
      exit 0
   else
      echo "Re-running deploy"
      break
   fi
done

set -x

private_key=`cat bootstrap.private-key`

javascript_file=generated.rhoid.bootstrap.js
json_file=generated.rhoid.bootstrap.json

# Get everything, including system classes
git clone https://github.com/rchain/rchain.git || (cd rchain && git pull)

# Updating our local source should be an option -- look into the wisdom of this
#git pull https://github.com/rchain-community/liquid-democracy.git

rnode run -s \
   --validator-private-key $private_key \
   --dev-mode \
   -XX:MaxDirectMemorySize=100m -XX:MaxRAMPercentage=25 \
   > redeploy.log 2>&1 &

set +x

PID=$!

# The previous command doesn't produce output -- but this makes up for that
tail -f redeploy.log|sed -e '/Making a transition to Running state./q'

deploy() {
   while read t;do
      ./deploy.sh $t
   done |tee -a deployment.log 2>&1
}

# deploy system code
find rchain -name "*.rho"|grep -v "test"|grep -v "tests" |grep -v "examples" | deploy

# deploy rgov
for i in \
../Community.rho \
../CrowdFund.rho \
../directory.rho \
../inbox.rho \
../Issue.rho \
../kudos.rho \
../log.rho \
../memberIdGovRev.rho \
../RevIssuer.rho \
./voter-insertion.rho \
;do
   echo $i | deploy
done

# Finalize the rnode
echo "Proposing...." | tee -a deployment.log
rnode --grpc-port 40402 propose 2>&1 | tee -a deployment.log
echo "Propose finished."

# generate javascript
gen_javascript() {
echo "// @ts-check"
egrep '^\["#define [^"][^"]*", `[^`]*`]|^\["Log contract created at"' | sort -u|sed '
s/\["Log contract created at"/["#define $Log"/
s/\["#define \$/\/** @type { FieldSpec } *\/\nexport const /
s/", /Reg = {\n\ttype: "uri",\n\tvalue: "/
s/\]/",\n};\n\n/
s/`//g
s/\t/  /g
'
}

echo "Generating javascript file [$javascript_file]"
gen_javascript < redeploy.log > $javascript_file

# generate json
gen_json() {
echo "{
   \"rhoid\": {"
egrep '^\["#define [^"][^"]*", `[^`]*`]|^\["Log contract created at"' | sort -u|sed '
s/\["Log contract created at"/["#define $Log"/
s/\["#define \$/    "/
s/, /: "/
s/\]/",/
s/`//g
'
echo '    "NecessaryInvalidPlaceholder": ""
  }
}'
}

echo "Generating json file [$json_file]"
gen_json < redeploy.log > $json_file

# generate and create the master contract directory
echo "Generating directory creation rholang"
./master-contract-directory.sh > generated.create-master-contract-directory.rho

echo "generated.create-master-contract-directory.rho"| deploy | tee -a redeploy.log
echo "Proposing master contract directory creation" |tee -a redeploy.log
rnode --grpc-port 40402 propose 2>&1|tee -a redeploy.log

echo "Stopping deployment rnode"
kill $PID

echo "Creating liquid-democracy-base checkpoint"
./create-checkpoint.sh liquid-democracy-base
