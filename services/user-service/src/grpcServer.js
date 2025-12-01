const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const UserService = require('./services/UserService');

const PROTO_PATH = path.join(__dirname, '../user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

function verifyCredentials(call, callback) {
  const { email, password } = call.request;
  UserService.verifyCredentials(email, password)
    .then(result => callback(null, result))
    .catch(err => callback(null, { success: false, userId: '', error: 'Internal error' }));
}

function main() {
  const server = new grpc.Server();
  server.addService(userProto.UserService.service, { VerifyCredentials: verifyCredentials });
  const port = process.env.GRPC_PORT || '50051';
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC server running at 0.0.0.0:${port}`);
    server.start();
  });
}

if (require.main === module) {
  main();
}

module.exports = main; 