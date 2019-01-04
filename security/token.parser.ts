import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import {User} from '../users/users.model';
import {environment} from '../common/environment';

export const tokenParser:restify.RequestHandler = (req,resp,next) => {
    const token = extractToken(req);
    if(token){
        jwt.verify(token, environment.security.apiSecret, applyBearer(req, next));
    } else{
        next();
    }
};


function extractToken(req: restify.Request){
    //Authorization: Bearer TOKEN 
    let token = undefined;
    const authorization = req.header('authorization');
    if(authorization){
        const parts:string[] = authorization.split(' ');
        if (parts.length > 2 && parts[0] === 'Bearer'){
            token = parts[1];
        }
    }
    return token;    
};

//Retorna função que no caso é a callback esperada pela verify do jwt
//Retorna o error mais o token decodificado
function applyBearer(req:restify.Request, next):(error, decoded) => void{
    //Assinatura da função de retornno
    return (error, decoded) =>{
        if(decoded){
            User.findByEmail(decoded.sub).then(user =>{
                if(user){
                    //Associar o usuário no request
                    req.authenticated = user;
                }
                next();
            }).catch(next);
        } else{
            next();
        }
    }
};