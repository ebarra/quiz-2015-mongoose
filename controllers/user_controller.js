var mongoose = require('mongoose');
var User = mongoose.model('User');

// MW que permite acciones solamente si el usuario objeto corresponde con el usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objUser = req.user.id;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;
    
    if (isAdmin || objUser === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function(req, res, next, userId) { 
  var options = { _id : userId };
  console.log("Load del user con id: " + userId);
  User.findOne(options, function (err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + userId));
    console.log("Usuario cargado con username: " + user.username);
    req.user = user;
    next();
  });
};

// Comprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function(login, password, callback) {
	var options = {username: login };
  User.findOne(options, function (err, user) {    	  		
        if (err) return next(err);
        if (user) {  
          if(user.verifyPassword(password)){
            callback(null, user);
        	}
        	else { 
            callback(new Error('Password erróneo.')); 
          }
        } else{
          callback(new Error('Usuario no encontrado.'));
        }
    });
};


// GET /user/:id/edit
exports.edit = function(req, res) {
  res.render('user/edit', { user: req.user, errors: []});
};            // req.user: instancia de user cargada con autoload

// GET /user
exports.new = function(req, res) {
    var user = new User({username: ""});
    res.render('user/new', {user: user, errors: []});
};

// POST /user
exports.create = function(req, res) {
    var user = new User(req.body.user);
    user.save(function (err, saved_user) {
      if (err) {
        return res.render('user', {
          errors: err.errors,
          user: user
        });
      } else {
        // crea la sesión para que el usuario acceda ya autenticado y redirige a /
        req.session.user = {id: saved_user.id, username: saved_user.username};
        res.redirect('/');
      }         
  });
};

// PUT /user/:id
exports.update = function(req, res, next) {
  req.user.username  = req.body.user.username;
  req.user.password  = req.body.user.password;

  req.user
  .save(function ( err, saved_user, count ){
      if( err ) return next( err );

      req.session.user = {id: saved_user.id, username: saved_user.username};
      res.redirect( '/' );
  });
};

// DELETE /user/:id
exports.destroy = function(req, res) {
  req.user.remove().then( function() {
    // borra la sesión y redirige a /
    delete req.session.user;
    res.redirect('/');
  });
};