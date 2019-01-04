import {ModelRouter} from '../common/model-router';
import * as restify from 'restify';
import {User} from './users.model';
import {NotFoundError} from 'restify-errors';
import {authenticate} from '../security/auth.handler';
import {authorize} from '../security/authz.handler';

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

       application.get({path:`${this.basePath}` , version:'2.0.0'},
       [authorize('admin'),
        this.findByEmail, 
        this.findAll]);//versão mais nova que consegue filtrar alguma coisa
       application.get({path:`${this.basePath}` , version:'1.0.0'}, [authorize('admin'),this.findAll]);
       application.get(`${this.basePath}/:id`,[authorize('admin'),this.validateId, this.findById]);
       application.post(`${this.basePath}`, [authorize('admin'), this.save]);
       application.put(`${this.basePath}/:id`,authorize('admin','user'),[this.validateId,this.replace]);
       application.patch(`${this.basePath}/:id`, [authorize('admin','user'),this.validateId,this.update]);
       application.del(`${this.basePath}/:id`, [authorize('admin'),this.validateId,this.delete]);

       application.post(`${this.basePath}/authenticate`, authenticate);
    }
}


export const usersRouter = new UserRouter();