
import * as restify from 'restify';
import { errorFromList } from 'verror';

export const handleError  = (req:restify.Request, resp:restify.Response, err, done) => {

    // console.log(err);

    err.toJSON = ()=>{
        return {
            message: err.message
        }
    }
    switch(err.name){
        case'MongoError':
            if(err.code === 11000){
                err.stautsCode = 400;
            }
            break;
        case 'ValidationError':
            err.stautsCode = 400;
            const messages :any[] = [];
            for(let name in err.errors){
                messages.push({message:err.errors[name].message});
            }
            
            err.toJSON = () => ({
                message:'Validation error while processing your request',
                errors: messages
            })
            break;
    }

    done();
}