#!/bin/bash

gen_dir_entry() {
cat - << EOF
         // insert the $1 class
         | lookup!(URI_$1, *$1_lookCh)
         | for (C <- $1_lookCh) {
            stdout!(["writing class to dictionary: $1 ", URI_$1, *C])
            | @write!("$1", *C, *stdout)
         }
EOF
}

gen_code() {
   cat - << EOF
new
   lookup(\`rho:registry:lookup\`),
   deployerId(\`rho:rchain:deployerId\`),
   deployId(\`rho:rchain:deployId\`),
   stdout(\`rho:io:stdout\`),
   insertArbitrary(\`rho:registry:insertArbitrary\`),
   lookCh,
   insertCh,
   caps
EOF

   echo "$1"|while read name id;do
      echo "   ,$name""_lookCh"
   done

   cat - << EOF2
in {
   lookup!(URI_Directory, *lookCh)
   | for (Dir <- lookCh) {
      Dir!(Nil, *caps)
      | for (@{"read": read, "write": write, "grant": grant} <- caps) {

         // Create a global reference to the master contract directory
         @[*deployerId, "MasterContractAdmin"]!({"read": read, "write": write, "grant": grant}) |
         insertArbitrary!(bundle+{read}, *insertCh) |
         for (URI <- insertCh) {
            stdout!({ "ReadcapURI": *URI}) |
            deployId!({ "ReadcapURI": *URI })
         }
EOF2

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
egrep '^\["#define [^"][^"]*", `[^`]*`]|^\["Log contract created at"' deploy-all.log | sort -u|sed '
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
      echo "URI_$name"
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
