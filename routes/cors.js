const express = require('express');
const cors = require('cors');

const whiteList = ['http://localhost:3000', 'https://localhost:3443'];

const corsOptionDelegate = (req, callback) => {
    var corsOptions;
    if (whiteList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    }
    else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions);
}
// Cross Origin Resource Sharing(CORS).
// Allowing other webpage to access from this resources.
exports.cors = cors();
exports.corsWithOptions = cors(corsOptionDelegate);