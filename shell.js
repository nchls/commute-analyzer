#!./bin/node
var repl = require('repl');
var context = repl.start('$ ').context;

context.Route = require('./src/models/Route');
context.Trip = require('./src/models/Trip');
context.Step = require('./src/models/Step');
context.CalculationQueueItem = require('./src/models/CalculationQueueItem');

context.utils = require('./src/utils');

context.db = require('./src/db/db');
