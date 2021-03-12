#!/bin/bash

ps a |grep -v grep |grep rnode && echo "
Cannot bootstrap: rnode is currently running
Use 'kill `ps a |grep -v grep |grep rnode|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`' to fix.
" && exit 1

[ -d ~/.rnode ] && echo "
Cannot bootstrap: $HOME/.rnode exists
Use 'rm -rf $HOME/.rnode' to fix.
" && exit 2

set -x

cd `dirname $0`

javascript_file=rhoid.bootstrap.js
json_file=rhoid.bootstrap.json

private_key=28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36

mkdir -p ~/.rnode || exit 3
tar cf - genesis|(cd ~/.rnode; tar xvf -) || exit 3

rnode run -s \
	--validator-private-key $private_key \
	--dev-mode \
	-XX:MaxDirectMemorySize=100m -XX:MaxRAMPercentage=25 \
	> bootstrap.log 2>&1 &

# The previous command doesn't produce output -- but this one makes up for that
tail -f bootstrap.log|sed -e '/Making a transition to Running state./q'

# Get everything, including system classes
git clone https://github.com/rchain/rchain.git

# Updating our local source should be an option -- look into the wisdom of this
#git pull https://github.com/rchain-community/liquid-democracy.git

set +x

deploy() {
	while read t;do
		echo "Deploying $t"
		rnode deploy \
		--valid-after-block-number 0 \
		--phlo-price 1 \
		--phlo-limit 10000000 \
		--private-key $private_key \
		$t
	done 2>&1
}

# deploy system code
find rchain -name "*.rho"|grep -v "test"|grep -v "tests" |grep -v "examples" | deploy | tee deploy.log

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
	echo $i | deploy | tee -a deploy.log
done

# Finalize the rnode
rnode --grpc-port 40402 propose 2>&1|tee -a deploy.log

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
gen_javascript < bootstrap.log > $javascript_file

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
gen_json < bootstrap.log > $json_file
