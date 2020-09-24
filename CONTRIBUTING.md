# Development and Design notes for Contributors

To deploy the contracts:

```
npm install
npx jake
```

## Automated deployment with jake

[Jake](https://jakejs.com/) is a JavaScript build tool for NodeJS, much like `make`.
_Recall that `npx` is a mechanism for launching executables in npm project dependencies,
i.e. in `node_modules/.bin`._

To list the build targets:

```
$ npx jake -t
jake default                    # deploy inbox.rho,directory.rho,Community.rho
jake startShard                 # start local shard with validator, observer
jake rho_modules/inbox.json     # deploy inbox.rho
jake rho_modules/directory.json # deploy directory.rho
jake rho_modules/Community.json # deploy Community.rho -> directory.rho
```

## `startShard` with docker-compose

_KLUDGE: this currently depends on `ln -s ../rnode-client-js docker-shard`
where `../rnode-client-js` is a a clone of that repo. Eventually
the `rchain-community/docker-shard` repo should subsume `rnode-client-js`
for this purpose and we and attach it as a git submodule._

If you get `Error: Could not visualize graph, casper instance was not available yet.`
wait until `MultiParentCasper instance created.` appears in the rnode log
and try again; this code isn't smart enough to do that automatically.

## Contract deployment with registry URI fixups

Note the use of `contractTask('Community.rho', ['directory.rho']);` in `Jakefile.js`
as well as the following idiom in `Community.rho`:

```scala
    match ("import", "./directory.rho", `rho:id:...`) {
    (_, _, directoryURI) => lookup!(directoryURI, *ret)
    }
```

The `contractTask` that deploys `directory.rho` saves the resulting URI
in `rho_modules/directory.json` so that the task for `Community.rho` can
substitute it in for `rho:id:...` above.

```
$ npx jake
Starting 'startShard'...
boot is up-to-date
read is up-to-date
TODO: wait for "MultiParentCasper instance created." in the log
Finished 'startShard' after 408 ms
Starting 'rho_modules'...
Finished 'rho_modules' after 1 ms
Starting 'rho_modules/inbox.json'...
inbox.rho deps: 0
resolve { src: 'inbox.rho' }
resolve { src: 'inbox.rho', depTargets: [] }
{ src: 'inbox.rho', byDep: {} }
inbox.rho deps: 0 { new Inbox, deployId(`r..... } http://127.0.0.1:40413 after:
inbox.rho deps: 0 { new Inbox, deployId(`r..... } http://127.0.0.1:40413 after: 9 sig: 3045022100bc1141bf2bfccf... deploy
inbox.rho deps: 0 { new Inbox, deployId(`r..... } http://127.0.0.1:40413 after: 9 sig: 3045022100bc1141bf2bfccf... deploy @
inbox.rho deps: 0 { new Inbox, deployId(`r..... } http://127.0.0.1:40413 after: 9 sig: 3045022100bc1141bf2bfccf... deploy @ @
inbox.rho deps: 0 { new Inbox, deployId(`r..... } http://127.0.0.1:40413 after: 9 sig: 3045022100bc1141bf2bfccf... deploy @ @ "rho:id:3xagffydedp5qq9y...
Finished 'rho_modules/inbox.json' after 15157 ms
Starting 'rho_modules/directory.json'...
directory.rho deps: 0
resolve { src: 'directory.rho' }
resolve { src: 'directory.rho', depTargets: [] }
{ src: 'directory.rho', byDep: {} }
directory.rho deps: 0 { new deployId(`rho:rchain... } http://127.0.0.1:40413 after:
directory.rho deps: 0 { new deployId(`rho:rchain... } http://127.0.0.1:40413 after: 10 sig: 3044022008d59c2461ba729c... deploy
directory.rho deps: 0 { new deployId(`rho:rchain... } http://127.0.0.1:40413 after: 10 sig: 3044022008d59c2461ba729c... deploy @
directory.rho deps: 0 { new deployId(`rho:rchain... } http://127.0.0.1:40413 after: 10 sig: 3044022008d59c2461ba729c... deploy @ @
directory.rho deps: 0 { new deployId(`rho:rchain... } http://127.0.0.1:40413 after: 10 sig: 3044022008d59c2461ba729c... deploy @ @ "rho:id:yzgukdzqe3bwbdb1...
Finished 'rho_modules/directory.json' after 15120 ms
Starting 'rho_modules/Community.json'...
Community.rho deps: 1
resolve { src: 'Community.rho' }
resolve { src: 'Community.rho', depTargets: [ 'rho_modules/directory.json' ] }
{
  src: 'Community.rho',
  byDep: {
    'directory.rho': 'rho:id:yzgukdzqe3bwbdb11dageiamnp1w83bh7j79kc8nqghg9qie95pt8d'
  }
}
Community.rho deps: 1 { new Community, commMap, ... } http://127.0.0.1:40413 after:
Community.rho deps: 1 { new Community, commMap, ... } http://127.0.0.1:40413 after: 11 sig: 3044022069195ae4be4aad4b... deploy
Community.rho deps: 1 { new Community, commMap, ... } http://127.0.0.1:40413 after: 11 sig: 3044022069195ae4be4aad4b... deploy @
Community.rho deps: 1 { new Community, commMap, ... } http://127.0.0.1:40413 after: 11 sig: 3044022069195ae4be4aad4b... deploy @ @
Community.rho deps: 1 { new Community, commMap, ... } http://127.0.0.1:40413 after: 11 sig: 3044022069195ae4be4aad4b... deploy @ @ "rho:id:r5f1x6zxerhcsp7a...
Finished 'rho_modules/Community.json' after 15155 ms
Starting 'default'...
{ SRCS: [ 'inbox.rho', 'directory.rho', 'Community.rho' ] }
Finished 'default' after 0 ms
```


## Misc: dependencies

We have a dependency on rchain-toolkit. For utils. This can go away soon, right?
