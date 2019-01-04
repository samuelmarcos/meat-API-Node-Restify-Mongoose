"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const users_model_1 = require("./users.model");
const auth_handler_1 = require("../security/auth.handler");
const authz_handler_1 = require("../security/authz.handler");
class UserRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User); //typescript pede pra chamar o construtor da superclasse
        //filtro por email
        this.findByEmail = (req, resp, next) => {
            if (req.query.email) {
                users_model_1.User.findByEmail(req.query.email)
                    .then(user => {
                    if (user) {
                        return [user];
                    }
                    else
                        [];
                })
                    .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.url
                }))
                    .catch(next);
            }
            else {
                next();
            }
        };
        this.on('beforeRender', document => {
            //funçao que me permite modificar o documento
            document.password = undefined;
            //ou pode usar delete document.password
        });
    }
    applayRoutes(application) {
        application.get({ path: `${this.basePath}`, version: '2.0.0' }, [authz_handler_1.authorize('admin'),
            this.findByEmail,
            this.findAll]); //versão mais nova que consegue filtrar alguma coisa
        application.get({ path: `${this.basePath}`, version: '1.0.0' }, [authz_handler_1.authorize('admin'), this.findAll]);
        application.get(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authz_handler_1.authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, authz_handler_1.authorize('admin', 'user'), [this.validateId, this.replace]);
        application.patch(`${this.basePath}/:id`, [authz_handler_1.authorize('admin', 'user'), this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.delete]);
        application.post(`${this.basePath}/authenticate`, auth_handler_1.authenticate);
    }
}
exports.usersRouter = new UserRouter();
