const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protobuffs/recipes.proto'));
const recipesProto = grpc.loadPackageDefinition(packageDefinition);

const recipes = [
  {
    id: 100,
    productId: 1000,
    title: 'Pizza',
    notes: 'See video: pizza_recipe.mp4. Use oven No. 12'
  },
  {
    id: 200,
    productId: 2000,
    title: 'Lasagna',
    notes: 'Ask from John. Use any oven, but make sure to pre-heat it!'
  }
];

function findRecipes(call, callback) {
  console.log(call);

  const recipe = recipes.find((r) => r.productId === call.request.id);

  if (recipe) {
    callback(null, recipe);
    return;
  }

  callback({
    message: 'Recipe not found',
    code: grpc.status.NOT_FOUND,
  });
}

const server = new grpc.Server();

server.addService(recipesProto.Recipes.service, { find: findRecipes });
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Server running.');
});
