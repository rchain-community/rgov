/* eslint-disable */
// This is only needed in localhost mode and DOES NOT work with other networks
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const rchainToolkit = require('rchain-toolkit');

module.exports = {
  propose: async () => {
    // The propose neeeds another grpc service
    const grpcClient = await rchainToolkit.grpc.getGrpcProposeClient(
      'localhost:40402',
      grpc,
      protoLoader,
    );

    let proposeResponse;
    try {
      proposeResponse = await rchainToolkit.grpc.propose({}, grpcClient);
      //const data = rchainToolkit.utils.rhoValToJs(JSON.parse(result).expr[0]);
    } catch (err) {
      console.log(err);
    }

    console.log(proposeResponse);
    return proposeResponse;
  },
};
