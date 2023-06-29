const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protobuffs/processing.proto'));
const processingProto = grpc.loadPackageDefinition(packageDefinition);

function process(call) {
  const { orderId, recipeId } = call.request;
  const time = orderId * 1000 + recipeId * 10;

  call.write({ status: 2 });

  setTimeout(() => {
    call.write({ status: 3 });
    setTimeout(() => {
      call.write({ status: 4 });
      call.end();
    });
  }, time);
}

const server = new grpc.Server();

server.addService(processingProto.Processing.service, { process });
server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Server running.');
});