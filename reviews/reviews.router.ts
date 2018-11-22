import {ModelRouter} from '../common/model-router';
import * as restify from 'restify';
import {Review} from '../reviews/reviews.model';
import * as mongoose from 'mongoose';



class ReviewRouter extends ModelRouter<Review>{
    constructor(){
        super(Review);
    }

    protected prepareOne(query:mongoose.DocumentQuery<Review,Review>):mongoose.DocumentQuery<Review,Review>{
        return query.populate('user', 'name')
                    .populate('restaurant', 'name')

    }

    envelope(document){
        let resource = super.envelope(document);
        const restId = document.restaurant._id ? document.restaurant._id : document.restaurant;
        resource._links.restaurant = `/restaurants/${restId}`;
        return resource;
    }

    // findById = (req, resp, next) => {
    //     this.model.findById(req.params.id)
    //         .populate('user', 'name')
    //         .populate('restaurant')
    //         .then(this.render(resp,next))
    //         .catch(next);
    // }

    applayRoutes(application: restify.Server){
        application.get(`${this.basePath}`, this.findAll);
        application.get(`${this.basePath}`,[this.validateId, this.findById]);
        application.post(`${this.basePath}`,this.save);
     }
}


export const reviewRouter = new ReviewRouter();