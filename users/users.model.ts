import * as mongoose from 'mongoose';
import {validateCPF} from '../common/validators';
import * as bcrypt from 'bcrypt';
import {environment} from '../common/environment';
//em runtime as interfaces nao são exportadas 
//seo sera exportado o document
export interface User extends mongoose.Document{
    name: string,
    email:string,
    password:string,
    cpf:string,
    gender:string,
    profiles: string[],
    matches(password:string):boolean
    hasAny(...profiles:string[]):boolean
    //hasAny(['admin', 'user'])
}
//criando esta interface
//User vai ter todas as propriedades que o Model do mongoose TextMetrics, mais a propriedade findByEmail
export interface UserModel extends mongoose.Model<User>{
    findByEmail(email:string, projection?:string):Promise<User>
}

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    email:{
        type:String,
        unique: true,
        require: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        //expressão regex que faz match 
    },
    password:{
        type:String,
        select: false,
        required: true
    },
    gender:{
        type: String,
        required: false,
        enum:['Male', 'Famele']
    },
    cpf:{
        type:String,
        required: false,
        validate:{
            validator: validateCPF,//passar a funçao responsavel por validar o cpf
            message: '{PATH}Invalid CPF ({VALUE})',//mensagem a ser exibida caso falhe
        }
    },
    profiles:{
        type:[String],
        required:false
    }
});
//Statics adiciona um método estático de classe
userSchema.statics.findByEmail = function(email:string, projection:string){
    //o this nesse caso já faz referencia ao Model !, por isso não usa arrow function
    return this.findOne({email}, projection);//{email:email} es2015
}
//para adicionar um método de instância usamos methods
userSchema.methods.matches = function(password:string):boolean{
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.hasAny = function(...profiles:string[]):boolean{
    return profiles.some(profile => this.profiles.indexOf(profile) !== -1);
}

const hashPassword = (obj, next) => {
    bcrypt.hash(obj.password, environment.security.saltRounds)
              .then(hash =>{
                  obj.password = hash;
                  next();
              }).catch(next);
}

const saveMiddleware = function(next){
    //this ira referenciar neste caso ao documento
    //passar o contexto para a const user
    const user : User = this;
    //caso o campo não foi modificado
    //executo o funçao one way hash
    if(!user.isModified('password')){
        next()
    }else{
        hashPassword(user,next);
    }
}

const updateMiddleware = function(next){
    if(!this.getUpdate().password){
        next();
    }else{
        hashPassword(this.getUpdate().password, next);
    }
}

userSchema.pre('save', saveMiddleware);
userSchema.pre('findOneAndUpdate', updateMiddleware);
userSchema.pre('update',updateMiddleware);


export const User =  mongoose.model<User, UserModel>('User', userSchema);