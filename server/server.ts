import * as restify from 'restify';
import * as mongoose from 'mongoose';
import {Router} from '../common/router';
import {environment} from '../common/environment';
import {mergePatchBodyParser} from './merge-patch.server';
import {handleError} from './error.handler';

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
                this.application = restify.createServer({
                    name:'meat-api',
                    version:'1.0.0'
                });
                
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(mergePatchBodyParser);
                this.application.on('restifyError', handleError);

                //routes
                for(let route of routers){//for com objeto eh com 'of'
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