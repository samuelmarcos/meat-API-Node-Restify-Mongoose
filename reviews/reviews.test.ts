import 'jest';
import * as request from 'supertest';
import {environment} from '../common/environment';
import { response } from 'spdy';


const adress : string = (<any>global).adress;
const auth : string = (<any>global).auth;

test('get /reviews', ()=> {
   return request(adress)//return informa o jest que estamos esperando uma resposta
        .get('/reviews')
        .then(response => {
            expect(response.status).toBe(200)//espero que a resposta seje 200
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(fail);//chama a funcao global fail e passa  o erro para ela
}); 

test('get /reviews/aaaa - not found' , ()=>{
    return request(adress)
        .get('/reviews/aaaa')
        .then(resposnse =>{
            expect(resposnse.status).toBe(404);
        }).catch(fail)
});


test.skip('post /reviews', ()=>{
    return request(adress)
        .post('/reviews')
        .set('Authorization', auth)
        .send({
            date: Date.now(),
            rating: 4,
            comments:'Very good',
        })
        .then(response =>{
            expect(response.status).toBe(404);
            expect(response.body.rating).toBe(4)
            expect(response.body.comments).toBe('Very good')
        })
        .catch(fail)
});

test.skip('patch /reviews/:id', ()=>{
    return request(adress)
        .post('/reviews')
        .set('Authorization', auth)
        .send({
            date: Date.now(),
            rating: 5,
            comments:'Very bad food man',
        })
        .then(response => request(adress)
                            .patch(`/reviews/${response.body._id}`)
                            .send({
                                rating:6
                            }))
        .then(response=>{
            expect(response.status).toBe(404)
            expect(response.body.rating).toBe(6)
        })
                            
});
