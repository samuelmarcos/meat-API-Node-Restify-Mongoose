import {ModelRouter} from '../common/model-router';
import * as restify from 'restify';
import {User} from './users.model';
import {NotFoundError} from 'restify-errors';

class UserRouter extends ModelRouter<User>{

    constructor(){
        super(User);//typescript pede pra chamar o construtor da superclasse
        this.on('beforeRender', document => {
            //funçao que me permite modificar o documento
            document.password = undefined;
            //ou pode usar delete document.password
        });
    }
    //filtro por email
    findByEmail = (req,resp,next) => {
        if(req.query.email){
            User.findByEmail(req.query.email)
                .then(user => {
                    if(user){
                        return [user]
                    }else []
                })
                .then(this.renderAll(resp,next, {
                    pageSize:this.pageSize,
                    url:req.url
                }))
                .catch(next);
        }else{
            next()
        }
    }

    applayRoutes(application: restify.Server){

       application.get({path:`${this.basePath}` , version:'2.0.0'}, [this.findByEmail, this.findAll]);//versão mais nova que consegue filtrar alguma coisa
       application.get({path:`${this.basePath}` , version:'1.0.0'}, this.findAll);
       application.get(`${this.basePath}/:id`,[this.validateId, this.findById]);
       application.post(`${this.basePath}`, this.save);
       application.put(`${this.basePath}/:id`,[this.validateId,this.replace]);
       application.patch(`${this.basePath}/:id`, [this.validateId,this.update]);
       application.del(`${this.basePath}/:id`, [this.validateId,this.delete]);
    }
}


export const usersRouter = new UserRouter();