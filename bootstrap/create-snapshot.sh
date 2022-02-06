#!/bin/bash

# Find out if they gave us a snapshot name
[ -z "$1" ] && echo "Please specify snapshot name" && exit 1

# Find out if there's a localhost .rnode
[ ! -d ~/.rnode ] && echo "Cannot snapshot: $HOME/.rnode does not exist" && exit 2

# Change directory to wherever this script is located
! cd "$(dirname "$0")" && echo "Could not cd to script directory" && exit 1

# Stop the running rnode
! ./stop-rnode && exit $?

# Make sure there's a snapshot directory
mkdir -p snapshot

# The snapshot to create
TARGET="$PWD/snapshot/$1.tgz"

# See if the snapsahot already exists
[ -f "$TARGET" ] && while read -r -p "$TARGET already exists. Replace [y]? " response;do
   if [ "$response" == 'y' ] || [ -z "$response" ]; then
      break
   else
      echo "Aborted"
      exit 0
   fi
done

# Change to $HOME and tar up the .rnode into the snapshot
(cd ~ && tar czf "$TARGET" .rnode)

# Make the user feel good
echo "snapshot created: $TARGET"
