#!/bin/bash

gen_dir_entry() {
cat - << EOF
         // insert the $1 class
         | lookup!(UID_$1, *lookCh)
         | for (C <- lookCh) {
            stdout!(["writing class to dictionary: $1 ", UID_$1, *C])
            | @write!("$1", *C, *stdout)
         }
EOF
}

gen_code() {
   cat - << EOF
new
   lookup(\`rho:registry:lookup\`),
   deployerId(\`rho:rchain:deployerId\`),
   stdout(\`rho:io:stdout\`),
   lookCh,
   caps
in {
   lookup!(UID_Directory, *lookCh)
   | for (Dir <- lookCh) {
      Dir!(*caps)
      | for (@{"read": read, "write": write, "grant": grant} <- caps) {

         // Create a global reference to the master contract directory
         @[*deployerId, "MasterContractAdmin"]!({"read": read, "write": write, "grant": grant})
EOF

   echo "$1"|while read name id;do
      gen_dir_entry $name
   done

   cat << EOF2
      }
   }
}
EOF2
}

get_classes() {
egrep '^\["#define [^"][^"]*", `[^`]*`]|^\["Log contract created at"' redeploy.log | sort -u|sed '
   s/\["Log contract created at"/["#define $Log"/
   ' |
   cut -d' ' -f2,3 | sed 's/[$",`\]]*//g'
}

gen_match() {
   tmp="false"
   echo "$1" | while read name id;do
      if [ -z "$tmp" ];then echo -n ",";else unset tmp;fi
      echo "\`$id\`"
   done
}

gen_vars() {
   tmp="false"
   echo "$1" | while read name id;do
      if [ -z "$tmp" ];then echo -n ",";else unset tmp;fi
      echo "UID_$name"
   done
}

CLASSES=`get_classes`

MATCH=`gen_match "$CLASSES"|sed 's/^/   /'`
VARS=`gen_vars "$CLASSES"|sed 's/^/   /'`
CODE=`gen_code "$CLASSES"|sed 's/^/   /'`

cat - << EOF
match [
$MATCH
]{[
$VARS
] => {
$CODE
} // end of =>
} // end of match
EOF
