var mongoose = require('mongoose');
var Quiz = mongoose.model('Quiz');
var User = mongoose.model('User');


// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.autor.id;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
  var options = { _id : quizId };
  console.log("Load del quiz con id: " + quizId);
  Quiz.findOne(options, function (err, quiz) {
    if (err) return next(err);
    if (!quiz) return next(new Error('No existe quizId=' + quizId));
    console.log("Quiz cargado con pregunta: " + quiz.pregunta);
    req.quiz = quiz;
    next();
  });  
};

// GET /quizes
// GET /users/:userId/quizes
exports.index = function(req, res) {  
  var options = {};
  if(req.user){
    options = {"autor.id": req.user.id}
  }
  
  Quiz.find(options, function(err, quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: []});
    }
  );
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};            // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = {pregunta: "Pregunta", respuesta: "Respuesta"};

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.autor = {id: req.session.user.id, username: req.session.user.username};  
  var quiz = new Quiz( req.body.quiz );

  quiz.save(function (err, saved_quiz) {
      if (err) {
        return res.render('quiz', {
          errors: err.errors,
          quiz: quiz
        });
      } else {     
        console.log("Salvado el quiz con pregunta:" + saved_quiz.pregunta)   
        res.redirect('/quizes');
      }         
  });

};


// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {  
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz.save(function ( err, saved_quiz, count ){
      if( err ) return next( err );

      res.redirect( '/quizes' );
  });
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.remove().then( function() {
    // borra la sesión y redirige a /quizes 
    res.redirect('/quizes');
  });
};
