import * as restify from 'restify';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import {Router} from '../common/router';
import {environment} from '../common/environment';
import {mergePatchBodyParser} from './merge-patch.server';
import {handleError} from './error.handler';
import {tokenParser} from '../security/token.parser';
import {logger} from '../common/logger';

export class Server{

    application: restify.Server;

    initializeDb():mongoose.MongooseThenable{

        (<any>mongoose).Promise = global.Promise;
        return mongoose.connect(environment.db.url, {
            useMongoClient: true
        })
    }

    initRoutes(routers:Router[]):Promise<any>{
        return new Promise((resolve, reject) =>{
            try{

                const options:restify.ServerOptions = {
                    name:'meat-api',
                    version:'1.0.0',
                    log:logger
                }
                if(environment.security.enableHTTPS){
                    options.certificate = fs.readFileSync(environment.security.certificate);
                    options.key = fs.readFileSync(environment.security.key);
                }

                this.application = restify.createServer(options);
                
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(mergePatchBodyParser);
                this.application.on('restifyError', handleError);
                this.application.use(tokenParser);//colocando no use o tokenParser estará disponível em todo request

                //request logger
                this.application.pre(restify.plugins.requestLogger({
                    log:logger,//logger parent
                    
                }));

                //colocar as informações que vem no request
                //callback de assinatura (req,resp,error)
                this.application.on('after', restify.plugins.auditLogger({
                    log:logger,
                    event:'after',
                    server:this.application,//passando o server, é possível se inscrever no evento audit abaixo
                    body:true//logar o body no request
                }));

                /*this.application.on('audit', data=>{

                });
                */

                //routes
                for(let route of routers){//for com objeto eh com 'in'
                    route.applayRoutes(this.application);
                }
            
                this.application.listen(environment.server.port, ()=>{
                    resolve(this.application);
                });

            }
            catch(error){
                reject(error);
            }
        })
    }
    bootstrap(routers:Router[] = []):Promise<Server>{
        return this.initializeDb().then(() => 
               this.initRoutes(routers).then(()=> this)); 
    }

    shutdown(){
        return mongoose.disconnect().then(this.application.close());
    }
}