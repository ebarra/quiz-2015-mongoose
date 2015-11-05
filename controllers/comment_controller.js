var mongoose = require('mongoose');
var Quiz = mongoose.model('Quiz');
var User = mongoose.model('User');


// MW que permite acciones solamente si el quiz al que pertenece el comentario objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){    
    if (req.quiz) {
        var objQuizOwner = req.quiz.autor.id;
        var logUser = req.session.user.id;
        var isAdmin = req.session.user.isAdmin;

        console.log(objQuizOwner, logUser, isAdmin);

        if (isAdmin || objQuizOwner === logUser) {
            next();
        } else {
            res.redirect('/');
        }
    }
};

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
  res.render('comments/new.ejs', {quizid: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res) {
  var comment = { texto: req.body.comment.texto, publicado: false,          
                  autor: {id: req.session.user.id, username: req.session.user.username}};

  req.quiz.comments.push(comment);

  req.quiz.save(function (err, saved_quiz) {
      if (err) {
        return res.render('comments/new.ejs', {comment: comment, errors: err.errors});        
      } else {     
        console.log("Salvado el comentario");
        res.redirect('/quizes/'+saved_quiz.id);
      }         
  });
};

// GET /quizes/:quizId/comments/:commentId/publish
//commentId es el orden en el array
exports.publish = function(req, res) {
  req.quiz.comments[req.params["commentId"]].publicado = true;
  req.quiz.save(function (err, saved_quiz) {
      if (err) {
        next(err);        
      } else {     
        console.log("Publicado el comentario");
        res.redirect('/quizes/'+saved_quiz.id);
      }         
  });

};