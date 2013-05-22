
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var ejs = require('ejs');
ejs.open = '{{';
ejs.close = '}}';

var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://localhost:27017/address-book");

var personSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    avatar: String,
    email: String,
    phone: String
});
var Person = mongoose.model('person', personSchema);


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.post('/person', function(request, response) {
    var person = new Person();
    person.firstName = request.body.firstName;
    person.lastName = request.body.lastName;
    person.email = request.body.email;
    person.phone = request.body.phone;
    person.save(function(err, p) {
        if(!err) {
            response.send(p);
        } else {
            response.send(500);
        }
    });
});

app.get('/person', function(request, response) {
    Person.find(function(err, list) {
        if(!err) {
            response.send(list);
        } else {
            response.send(500);
        }
    })
});

app.get('/person/:id', function(request, response) {
    var id = request.params.id;
    console.log('Searching for ' + id);
    Person.findById(id, function(err, person) {
        if(!err) {
            response.send(person);
        } else {
            response.send(404);
        }
    });
});

app.put('/person/:id', function(request, response) {
    var id = request.params.id;
    console.log('Searching for ' + id);
    Person.findById(id, function(err, person) {
        if(!err) {
            person.firstName = request.body.firstName;
            person.lastName = request.body.lastName;
            person.email = request.body.email;
            person.phone = request.body.phone;
            person.save(function(err, p) {
                if(!err) {
                    response.send(p);
                } else {
                    response.send(500);
                }
            });
        } else {
            response.send(404);
        }
    });
});

app.delete('/person/:id', function(request, response) {
    var id = request.params.id;
    console.log('Searching for ' + id);
    Person.findById(id, function(err, person) {
        if(!err) {
            person.remove();
            response.send('');
        } else {
            response.send(404);
        }
    });
});


app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
