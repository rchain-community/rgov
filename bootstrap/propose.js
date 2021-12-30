#!/usr/bin/env node


//This is only needed in localhost mode and DOES NOT work with other networks
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const rchainToolkit = require('rchain-toolkit');

const main = async () => {
  // The propose neeeds another grpc service
  const grpcClient = await rchainToolkit.grpc.getGrpcProposeClient(
    'localhost:40402',
    grpc,
    protoLoader
  );

  let proposeResponse;
  try {
    proposeResponse = await rchainToolkit.grpc.propose({}, grpcClient);
  } catch (err) {
    console.log(err);
  }

  console.log(proposeResponse);
};

main();
