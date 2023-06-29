const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinitionRecipes = protoLoader.loadSync(path.join(__dirname, '../protobuffs/recipes.proto'));
const packageDefinitionProcess = protoLoader.loadSync(path.join(__dirname, '../protobuffs/processing.proto'));

const recipesProto = grpc.loadPackageDefinition(packageDefinitionRecipes);
const processProto = grpc.loadPackageDefinition(packageDefinitionProcess);

const recipesStub = new recipesProto.Recipes('127.0.0.1:50051', grpc.credentials.createInsecure());
const processStub = new processProto.Processing('127.0.0.1:50052', grpc.credentials.createInsecure());

const productId = 1000;
const orderId = 1;

recipesStub.find({ id: productId }, (err, recipe) => {
  if (err && err.code === grpc.status.NOT_FOUND) {
    console.log('Recipe not found');
    return;
  }

  console.log('Found a recipe:');
  console.log(recipe);
  console.log('Processing...');
  
  const call = processStub.process({ orderId, recipeId: recipe.id});
  call.on('data', (statusUpdate) => {
    console.log('Order status changed:');
    console.log(statusUpdate);
  });

  call.on('end', () => {
    console.log('Processing done.');
  });
});