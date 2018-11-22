import 'jest';
import * as request from 'supertest';
import {environment} from '../common/environment';


let adress : string = (<any>global).adress;

test('get /reviews', ()=> {
   return request(adress)//return informa o jest que estamos esperando uma resposta
        .get('/reviews')
        .then(response => {
            expect(response.status).toBe(200)//espero que a resposta seje 200
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(fail);//chama a funcao global fail e passa  o erro para ela
}); 