"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 2;
        this.validateId = (req, resp, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Document not found'));
            }
            else {
                next();
            }
        };
        this.findAll = (req, resp, next) => {
            let page = parseInt(req.query._page || 1);
            page = page > 0 ? page : 1;
            const skip = (page - 1) * this.pageSize;
            this.model.count({}).exec()
                .then(count => this.model.find()
                .skip(skip)
                .limit(this.pageSize) //limita o numero de documentos que o metodo find traz
                .then(this.renderAll(resp, next, { page, count, pageSize: this.pageSize, url: req.url })))
                .catch(next);
        };
        this.findById = (req, resp, next) => {
            this.prepareOne(this.model.findById(req.params.id))
                .then(this.render(resp, next))
                .catch(next);
        };
        //metodo post = save
        this.save = (req, resp, next) => {
            let document = new this.model(req.body); //usar o plugin body parser
            document.save()
                .then(this.render(resp, next))
                .catch(next);
        };
        //metodo put = replace
        this.replace = (req, resp, next) => {
            this.model.update({ _id: req.params.id }, req.body, { runValidators: true, overwrite: true }).exec()
                .then((result) => {
                if (result.n) {
                    return this.model.findById(req.params.id);
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado ');
                    return next();
                }
            }).then(this.render(resp, next))
                .catch(next);
        };
        //metoo patch = update
        this.update = (req, resp, next) => {
            this.model.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
                .then(this.render(resp, next))
                .catch(next);
        };
        this.delete = (req, resp, next) => {
            this.model.remove({ _id: req.params.id }).exec().then((cmdResult) => {
                if (cmdResult.result.n) {
                    resp.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado ');
                }
                return next();
            }).catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    prepareOne(query) {
        return query;
    }
    envelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        //self = nome do link
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    evelopeAll(documents, options = {}) {
        const resource = {
            _links: {
                self: options.url
            },
            items: documents
        };
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
            }
            const remaining = options.count - (options.page * options.pageSize);
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
            }
        }
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
