# Development and Design notes for Contributors

## Automated deployment with jake

For example:

```
$ npm install
...
$ npx jake
Starting 'startShard'...
boot is up-to-date
read is up-to-date
Finished 'startShard' after 415 ms
Starting ',deployed/inbox.rho'...
Starting ',deployed/directory.rho'...
Starting ',deployed/Community.rho'...
get recent block from http://127.0.0.1:40413
get recent block from http://127.0.0.1:40413
get recent block from http://127.0.0.1:40413
deploy: { term: 'new Community, commMap, ', api: 'http://127.0.0.1:40403' }
deploy: { term: 'new stdout(`rho:io:stdou', api: 'http://127.0.0.1:40403' }
deploy: { term: 'new directory in {\n  con', api: 'http://127.0.0.1:40403' }
TODO: get result
Finished ',deployed/Community.rho' after 150 ms
TODO: get result
Finished ',deployed/directory.rho' after 176 ms
TODO: get result
Finished ',deployed/inbox.rho' after 186 ms
Starting 'default'...
{ SRCS: [ 'inbox.rho', 'directory.rho', 'Community.rho' ] }
Finished 'default' after 0 ms
```

## Misc: dependencies

We have a dependency on rchain-toolkit. For utils. This can go away soon, right?

