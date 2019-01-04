import 'jest';
import * as request from 'supertest';
import {Server} from '../server/server';
import {environment} from '../common/environment';
import {Restaurant} from './restaurants.model';
import { response } from 'spdy';
import { ReplSet } from 'mongodb';

let adress : string = (<any>global).adress;


test.skip('get /restaurants', ()=> {
    return request(adress)//return informa o jest que estamos esperando uma resposta
         .get('/restaurants')
         .then(response => {
             expect(response.status).toBe(200)//espero que a resposta seje 200
             expect(response.body.items).toBeInstanceOf(Array);
         }).catch(fail);//chama a funcao global fail e passa  o erro para ela
 }); 


 test('get /restaurants/aaaa - not found' , ()=>{
    return request(adress)
        .get('/restaurants/aaaa')
        .then(resposnse =>{
            expect(resposnse.status).toBe(404);
        }).catch(fail)
});

test('post /restaurants' , ()=>{
    return request(adress)
        .post('/restaurants')
        .send({
            name:'Bob Burgger',
            menu:[]
        })
        .then(response =>{
            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Bob Burgger')
        })
});