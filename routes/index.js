var express = require('express');
var db = require('../db');

function fetchTodos(req, res, next) {
  if (!req.user) { return res.redirect('/'); }
  db.all('SELECT * FROM todos WHERE owner_id = ?', [
    req.user.id
  ], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed == 1 ? true : false,
        url: '/' + row.id
      }
    });
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  });
}

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchTodos, function(req, res, next) {
  res.locals.filter = null;
  res.render('index', { user: req.user });
});

router.get('/protected', (req, res) => {
  if (!req.user) { return res.render('home'); }
  
  return res.send('hello')
})

router.get('/active', fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
  res.locals.filter = 'active';
  res.render('index', { user: req.user });
});

router.get('/completed', fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
  res.locals.filter = 'completed';
  res.render('index', { user: req.user });
});

router.post('/', function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  return res.redirect('/' + (req.body.filter || ''));
}, function(req, res, next) {
  db.run('INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)', [
    req.user.id,
    req.body.title,
    req.body.completed == true ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)', function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
}, function(req, res, next) {
  db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?', [
    req.body.title,
    req.body.completed !== undefined ? 1 : null,
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)/delete', function(req, res, next) {
  db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/toggle-all', function(req, res, next) {
  db.run('UPDATE todos SET completed = ? WHERE owner_id = ?', [
    req.body.completed !== undefined ? 1 : null,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/clear-completed', function(req, res, next) {
  db.run('DELETE FROM todos WHERE owner_id = ? AND completed = ?', [
    req.user.id,
    1
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

module.exports = router;
