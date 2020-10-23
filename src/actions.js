export const actions = {
  helloWorld: {
    template: `new world in { world!("Hello!") }`,
  },
  checkRegistration: {
    fields: {
      votersUri: {
        value: 'rho:id:admzpibb3gxxp18idri7h6eneg4io6myfmcmjhufc6asy73bgrojop',
        type: 'uri',
      },
    },
    template: `
    new return(\`rho:rchain:deployId\`),
      lookup(\`rho:registry:lookup\`),
      deployerId(\`rho:rchain:deployerId\`),
      DeployerIdOps(\`rho:rchain:deployerId:ops\`),
      deployerPubKeyBytesCh,
      revAddrCh,
      RevAddress(\`rho:rev:address\`),
      ch in
    {
      DeployerIdOps!("pubKeyBytes", *deployerId, *deployerPubKeyBytesCh) |
      for (@deployerPubKeyBytes <- deployerPubKeyBytesCh) {
        RevAddress!("fromPublicKey", deployerPubKeyBytes, *revAddrCh) |
        for (@deployerRevAddress <- revAddrCh) {
          lookup!(votersUri, *ch) |
          for (@addrSet <- ch) {
            return!(addrSet.contains(deployerRevAddress))
          }
        }
      }
    }`,
  },
};
