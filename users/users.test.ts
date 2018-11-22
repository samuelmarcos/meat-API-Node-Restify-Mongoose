import 'jest';
import * as request from 'supertest';
import {Server} from '../server/server';
import {environment} from '../common/environment';
import {usersRouter} from './users.router';
import {User} from './users.model';


let adress : string = (<any>global).adress;

test('get /users', ()=> {
   return request(adress)//return informa o jest que estamos esperando uma resposta
        .get('/users')
        .then(response => {
            expect(response.status).toBe(200)//espero que a resposta seje 200
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(fail);//chama a funcao global fail e passa  o erro para ela
}); 

test('post /users', ()=>{
    return request(adress)
        .post('/users')//temos de enviar um objeto no corpo
        .send({
            name:'usuario1',
            email:'usuario1@email.com',
            password:'123456',
            cpf:'845.956.660-98'
        })
        .then(response =>{
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('usuario1');
            expect(response.body.email).toBe('usuario1@email.com');
            expect(response.body.password).toBeUndefined();
            expect(response.body.cpf).toBe('845.956.660-98');

        }).catch(fail);
});

test('get /users/aaaa - not found' , ()=>{
    return request(adress)
        .get('/users/aaaa')
        .then(resposnse =>{
            expect(resposnse.status).toBe(404);
        }).catch(fail)
});

test('patch /users/:id' , () =>{
    return request(adress)
        .post('/users')//temos de enviar um objeto no corpo
        .send({
            name:'usuario2',
            email:'usuario2@email.com',
            password:'123456',
            
        })
        .then(response => request(adress)
                          .patch(`/users/${response.body._id}`)
                          .send({
                              name:'usuario2-patch'
                          }))
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('usuario2-patch');
            expect(response.body.email).toBe('usuario2@email.com');
            expect(response.body.password).toBeUndefined();
        })
        .catch(fail);
});



