import {Server} from './server/server';
import { error } from 'util';
import {usersRouter} from './users/users.router';
import {restaurantsRouter} from './restaurants/restaurants.router';
import {reviewRouter} from './reviews/reviews.router';

const server = new Server();

server.bootstrap([usersRouter, restaurantsRouter, reviewRouter]).then(server =>{console.log('Server listening on :', server.application.address())
                }).catch(error => {
                    console.log('Server fail to start');
                    process.exit(1);//encerra com saida anormal
                })