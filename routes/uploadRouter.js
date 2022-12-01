const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const authenticate = require('../authentication.js');
const cors = require('./cors.js');

// Configure where the upload image will be store
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

// Configure which file to be stored in server.
const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        // To reject this file pass `false`, like so:
        return cb(new Error('You can upload only image files!'), false);
    }
    // To accept the file pass `true`, like so:
    cb(null, true);
}

// Setup the malter
const upload = multer({ storage: storage, fileFilter: imageFileFilter });

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end("GET operation not supported on /imageUpload");
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,
        upload.single('imageFile'), // Specified upload single name.
        (req, res, next) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(req.file);
        })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /imageUpload");
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end("DELETE operation not supported on /imageUpload");
    })

module.exports = uploadRouter;