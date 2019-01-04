import {User} from './users/users.model';

//Declarar um modulo que fara um merge com a interface atual

declare module 'restify'{
    export interface Request{
        //adicionar a propriedade authenticated que agora ficará disponível
        authenticated:User
    }
}