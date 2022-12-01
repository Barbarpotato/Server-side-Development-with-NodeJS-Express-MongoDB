const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Favorite = require('../models/favorite.js');
const authenticate = require('../authentication.js');
const cors = require('./cors.js');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin) {
            // Not Allowing the admin account to do this operation.
            err = new Error("You are not authorized to perform this operation!");
            err.status = 403;
            return next(err);
        }
        /*Reference other collection to the Favorite model
            that has been defined in the favorite Model.*/
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                if (favorite !== null) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json({ favorite });
                }
                else {
                    err = new Error(`Dish ${req.params.dishId} not found!`)
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin) {
            // Not Allowing the admin account to do this operation.
            err = new Error("You are not authorized to perform this operation!");
            err.status = 403;
            return next(err);
        }
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                /* create new document if user id was not found
                otherwise push new element in the dishes field.*/
                let exist = false;
                if (favorite !== null) {
                    /*if user post the dishes that already exist in the document
                    then skipped the element, otherwise push the element in the dishes field document. */
                    for (let idx = 0; idx < req.body.length; idx++) {
                        for (let elem = 0; elem < favorite.dishes.length; elem++) {
                            if (favorite.dishes[elem].toString() == req.body[idx]._id) {
                                exist = true;
                                break
                            }
                        }
                        if (!exist) favorite.dishes.push(req.body[idx]._id);
                        exist = false;
                    }
                    favorite.save()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(result);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    Favorite.create({ user: req.user._id, dishes: req.body })
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(result);
                        })
                }
            })
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin) {
            // Not Allowing the admin account to do this operation.
            err = new Error("You are not authorized to perform this operation!");
            err.status = 403;
            return next(err);
        }
        // Removing the document from the collection.
        Favorite.remove({ user: req.user._id })
            .then((result) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(result);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

favoriteRouter.route('/:dishId')
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin) {
            // Not Allowing the admin account to do this operation.
            err = new Error("You are not authorized to perform this operation!");
            err.status = 403;
            return next(err);
        }
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite !== null) {
                    /* find the dishId that going to be post 
                    in the dishes array from the specific document.
                    push dishId to the array if it is not exist.*/
                    const filter = favorite.dishes.find((elem) => elem == req.params.dishId);
                    if (filter === undefined) favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    Favorite.create({ user: req.user._id, dishes: req.params.dishId })
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin) {
            // Not Allowing the admin account to do this operation.
            err = new Error("You are not authorized to perform this operation!");
            err.status = 403;
            return next(err);
        }
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite !== null) {
                    // Check if the dishId dosent exist in dishes field document, return err.
                    const filter = favorite.dishes.find((elem) => elem == req.params.dishId);
                    if (filter === undefined) {
                        err = new Error(`cant remove ${req.params.dishId} because it doesnt exist!`);
                        err.status = 403;
                        return next(err);
                    }
                    // delDishId return the array list that doesnt contain the dishId element.
                    const delDishId = favorite.dishes.filter((elem) => elem.toString() !== req.params.dishId.toString())
                    favorite.dishes = delDishId;
                    /* if delDishId have length = 0, than the document will deleted,
                    if delDishId have length > 0 save the modyfying Object to the database.*/
                    if (delDishId.length == 0) {
                        favorite.remove({ user: req.user._id })
                            .then((result) => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(result);
                            })
                    }
                    else {
                        favorite.save()
                            .then((result) => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(result);
                            })
                    }
                }
                else {
                    /*throw err if the user dont have the their document in
                    favorite collection.*/
                    err = new Error('You dont have the favorite dishes this time!');
                    err.status = 403;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;