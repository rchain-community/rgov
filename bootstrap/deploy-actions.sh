#!/bin/bash

deployFiles() {
   WAITPID=""
   while read -r t;do
      ./deploy "$t"
      # shellcheck disable=SC2030
      WAITPID="$WAITPID $!"
   done |tee -a log/deployment.log 2>&1
   # shellcheck disable=SC2031,SC2086
   wait $WAITPID
   echo "$ME: done status $?"
}

get_type_value() {
   head -n1 | sed '
      s/.*\[//
      s/\(.*\)].*/\1/
      s/[\t "]*//g
      s/,/ /g
      s/[\t ][\t ]*/ /g
   '
}

get_type_from_type_value() {
   sed '
      s/:[^ ]*//g
      s/[\t ][\t ]*/ /g
   '
}

get_value_from_type_value() {
   t=$(cat -)
   for i in $t;do
      blah=$(sed 's/^[^:][^:]*://' <<< "$i")
      if [ -z "$blah" ];then
         blah="\"\""
      fi
      echo -n "$blah "
   done
}

get_var() {
   head -n 2|tail -n 1|sed '
      s/.*\[//
      s/\(.*\)].*/\1/
      s/[\t ]*//g
      s/,/ /g
      s/[\t ][\t ]*/ /g
   '
}

make_field() {
   v=$(echo "$2"|cut -d' ' -f "$1")
   t=$(echo "$3"|cut -d' ' -f "$1")
   l=$(echo "$4"|cut -d' ' -f "$1")
   if [ "$l" = "\"\"" ];then unset l;fi
   if [ -z "$t" ];then t="string";fi
   echo "\"$v\": { \"type\": \"$t\", \"value\": \"$l\" }"
}

createAction() {
   type_value=$(get_type_value < "$1")
   var=$(get_var < "$1")

   type=$(echo "$type_value"|get_type_from_type_value)
   val=$(echo "$type_value"|get_value_from_type_value)

   echo "type_value=$type_value" >&2
   echo "var=$var" >&2
   echo "type=$type" >&2
   echo "val=$val" >&2

   unset fields
   if [ -n "$var" ];then
      len=$(echo "$var"|tr ' ' '\n'|wc -l)
      len=$((len+1))
      if [ $len -gt 1 ];then
         fields=$(make_field 1 "$var" "$type" "$val")
         for (( i=2; i<len; i++ ))
         do
            echo $fields
            fields="$fields, $(make_field "$i" "$var" "$type" "$val")"
         done
         echo $fields
      fi
   fi
   rholang=$(cat "$1"|sed 's,//.*,,'|sed 's/"/\\"/g')
   # rholang=$(cat "$1")
   str="
new __stdout(\`rho:io:stdout\`),__ret, __actDir, __deployerId(\`rho:rchain:deployerId\`) in {
   for (@{\"write\": __w, ..._} <<- @[*__deployerId, \"ActionDictionary\"]) {
      __stdout!({\"ActionDictionary write\": __w}) |
      @__w!(\"$(basename "$1")\", { \"fields\": { $fields },
      \"rholang\": \"$rholang\"}, *__ret)
   }
   |
   new
      mapCh
   in {
      for (r <- __ret) {
         __stdout!({\"directory write\": *r}) |
         for(@{\"read\": *read, ..._} <<- @[*__deployerId, \"ActionDictionary\"])
         {  __stdout!([\"read\", *read])
         |  read!(*mapCh)
         |  for (map <- mapCh)
            {  __stdout!(*map.keys().toList())
            |  __stdout!(*map)
            }
         }
      }
   }
}

"
   echo "$str" >/tmp/actions/"$(basename "$1")"
}

rm -rf /tmp/actions
mkdir /tmp/actions

for i in ../src/actions/*.rho;do
   createAction "$i"
done

ls /tmp/actions/*.rho|deployFiles
