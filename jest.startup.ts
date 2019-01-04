import 'jest';
import * as jestCli from 'jest-cli';
import * as request from 'supertest';
import {Server} from './server/server';
import {environment} from './common/environment';
import {usersRouter} from './users/users.router';
import {User} from './users/users.model';
import {reviewRouter} from './reviews/reviews.router';
import {restaurantsRouter} from './restaurants/restaurants.router';
import { Review } from './reviews/reviews.model';
import {Restaurant} from './restaurants/restaurants.model';

let adress : string;
let server : Server;

//função beforeAll sobe um ambiente antes de iniciar os testes
const beforeAllTests = () =>{
    //presets diferents antes de subir o novo ambiente
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001
    server = new Server()
    return server.bootstrap([usersRouter, reviewRouter,restaurantsRouter])
                 .then(()=> User.remove({}).exec())//remover o usuário para que eu possa rodar o teste novamente
                 .then(()=>{
                     let admin = new User()
                     admin.name = 'admin',
                     admin.email = 'admin@email.com',
                     admin.password = '123456',
                     admin.profiles = ['admin','user']
                     return admin.save()
                 })
                 .then(() => Review.remove({}).exec())
                 .then(()=>Restaurant.remove({}).exec())

                 
};

//depois de executar os teste, encerro a aplicação para que o processo nao fique preso
const afterAllTests = ()=>{
    return server.shutdown();
};

beforeAllTests()
.then(()=>jestCli.run())
.then(()=>afterAllTests())
.catch(console.error);