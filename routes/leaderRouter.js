const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const authenticate = require('../authentication.js');
const Leaders = require('../models/leaders.js');
const cors = require('./cors.js');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        // Get Resources from the server.
        Leaders.find({})
            .then((leaders) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leaders);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    // Control Route using JWT
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Create new resource and send to the server.
        // req.body.<the key properties in json file.>
        // will be available by using the third party module named body-parser
        Leaders.create(req.body)
            .then((leaders) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leaders);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Updating the existing resource from the server.
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.remove({})
            .then((leaders) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leaders);
            }, (err) => next(err))
            .catch((err) => next(err))
    })

leaderRouter.route('/:leaderId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Leaders.findById(req.params.leaderId)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.status(403).end(`${req.method} operation not supported on ${req.baseUrl}/${req.params.leaderId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndUpdate(req.params.leaderId, req.body)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Leaders.findByIdAndDelete(req.params.leaderId)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = leaderRouter;