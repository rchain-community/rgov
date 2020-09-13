# Development and Design notes for Contributors

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

Note that when you use this task, it's not smart enough to wait for
`MultiParentCasper instance created.` in the rnode log, so you have
to do that somewhat manually.

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


## Misc: dependencies

We have a dependency on rchain-toolkit. For utils. This can go away soon, right?
