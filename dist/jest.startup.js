"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const jestCli = require("jest-cli");
const server_1 = require("./server/server");
const environment_1 = require("./common/environment");
const users_router_1 = require("./users/users.router");
const users_model_1 = require("./users/users.model");
const reviews_router_1 = require("./reviews/reviews.router");
const restaurants_router_1 = require("./restaurants/restaurants.router");
const reviews_model_1 = require("./reviews/reviews.model");
const restaurants_model_1 = require("./restaurants/restaurants.model");
let adress;
let server;
//função beforeAll sobe um ambiente antes de iniciar os testes
const beforeAllTests = () => {
    //presets diferents antes de subir o novo ambiente
    environment_1.environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db';
    environment_1.environment.server.port = process.env.SERVER_PORT || 3001;
    server = new server_1.Server();
    return server.bootstrap([users_router_1.usersRouter, reviews_router_1.reviewRouter, restaurants_router_1.restaurantsRouter])
        .then(() => users_model_1.User.remove({}).exec()) //remover o usuário para que eu possa rodar o teste novamente
        .then(() => {
        let admin = new users_model_1.User();
        admin.name = 'admin',
            admin.email = 'admin@email.com',
            admin.password = '123456',
            admin.profiles = ['admin', 'user'];
        return admin.save();
    })
        .then(() => reviews_model_1.Review.remove({}).exec())
        .then(() => restaurants_model_1.Restaurant.remove({}).exec());
};
//depois de executar os teste, encerro a aplicação para que o processo nao fique preso
const afterAllTests = () => {
    return server.shutdown();
};
beforeAllTests()
    .then(() => jestCli.run())
    .then(() => afterAllTests())
    .catch(console.error);
