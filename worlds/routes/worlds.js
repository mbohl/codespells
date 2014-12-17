var express = require('express');
var worlds = require('../model/worlds');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {

    var world = new worlds(10, 10, 10, 30, 35, 35, 1, 3500, 5000);
    res.send(JSON.stringify(world));
});

/* GET users listing. */
router.get('/:iterations', function(req, res) {

    var world = new worlds(10, 10, 10, 30, 35, 35, 1, 3500, 5000);
    world.settle(req.params.iterations);
    res.send(JSON.stringify(world));
});

module.exports = router;
