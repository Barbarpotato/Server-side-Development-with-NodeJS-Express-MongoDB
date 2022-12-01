const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Dishes = require('../models/dishes.js');
const authenticate = require('../authentication.js');
const cors = require('./cors.js');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

// express.Router() is used to simplified build some routes by using the chaining technique.
// Create Main route path.
dishRouter.route('')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        // Get Resources from the server.
        Dishes.find({})
            // the specific Users document will be placed to the author field
            // inside the specific dish document.
            .populate('comments.author')
            // exec the dishes when promises fulfilled
            // when promise rejected exec err.
            // using the next() middleware argument
            // to pass the error through the other middleware.
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    // Control Route using JWT in first middeware.
    // Control admin route in the second middleware.
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Create new resource and send to the server.
        // req.body.<the key properties in json file.>
        // will be available by using the third party module named body-parser
        Dishes.create(req.body)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Updating the existing resource from the server.
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.remove({})
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "applicaation/json");
                res.json(dishes);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

// Create route path to /:dishId
dishRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "applicaation/json");
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        console.log(req.user.admin);
        res.status(403).end(`${req.method} operation not supported on ${req.baseUrl}/${req.params.dishId}`)
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, { $set: req.body }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "applicaation/json");
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId/comments')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                }
                else {
                    // err comes from the main script in app.js (last middleware in the app)
                    // we will throw our err information through the last middelware that handle error
                    // by using next().
                    err = new Error(`Dish ${req.params.dishId} not found!`)
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // Not allowing the admin to post some comment in the specific dish.
        if (req.user.admin) {
            err = new Error("You are not authorized to perform this operation!");
            err.status = 403;
            return next(err);
        }
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    // Cannot post comment, once user already post the comment.
                    const idx = dish.comments.findIndex((elem) => {
                        return elem.author.toString() == req.user._id.toString();
                    });
                    if (idx !== -1) {
                        err = new Error("You already post the comment!");
                        err.status = 403;
                        return next(err);
                    }
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    // save is used to store the modyfying object into our database.
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish.comments);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error(`Dish ${req.params.dishId} not found!`)
                    err.statusCode = 404;
                    return next(err);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes' + req.params.dishId + '/comments');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (let i = dish.comments.length - 1; i <= 0; i--) {
                        // using the id method to find the specific id in the arrays.
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    // store the modyfying object into our database.
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err));
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish.comments.id(req.params.commentId));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId
            + '/comments/' + req.params.commentId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    // prevent specific user to update the other users comment.
                    if (!dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
                        err = new Error("You are not authorized to perform this operation!");
                        err.status = 403;
                        return next(err);
                    }
                    if (req.body.rating) {
                        dish.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        dish.comments.id(req.params.commentId).comment = req.body.comment;
                    }
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    // Prevent user to delete other users comment.
                    if (!dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
                        err = new Error("You are not authorized to perform this operation!");
                        err.status = 403;
                        return next(err);
                    }
                    dish.comments.id(req.params.commentId).remove();
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            })
    })

module.exports = dishRouter;