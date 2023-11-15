import express from 'express';
import { Todo } from '../models/index.js'
// import db from '../../db';

async function fetchTodos(req, res, next) {
  try {
    let todos = await Todo.findAll({
      where: {
        userId: req.user.id
      }
    });
    console.log(todos);
    res.locals.todos = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed === 1,
      url: `/${todo.id}`,
    }));
    res.locals.activeCount = todos.filter((todo) => !todo.completed).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  } catch (e) {
    return next(e);
  }

  // db.all('SELECT * FROM todos WHERE owner_id = ?', [
  //   req.user.id,
  // // eslint-disable-next-line consistent-return
  // ], (err, rows) => {
  //   if (err) { return next(err); }

  //   const todos = rows.map((row) => ({
  //     id: row.id,
  //     title: row.title,
  //     completed: row.completed === 1,
  //     url: `/${row.id}`,
  //   }));
  //   res.locals.todos = todos;
  //   res.locals.activeCount = todos.filter((todo) => !todo.completed).length;
  //   res.locals.completedCount = todos.length - res.locals.activeCount;
  //   next();
  // });
}

const router = express.Router();

/* GET home page. */
// eslint-disable-next-line consistent-return
router.get('/', (req, res, next) => {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchTodos, (req, res) => {
  res.locals.filter = null;
  res.render('index', { user: req.user });
});

router.get('/active', fetchTodos, (req, res) => {
  res.locals.todos = res.locals.todos.filter((todo) => !todo.completed);
  res.locals.filter = 'active';
  res.render('index', { user: req.user });
});

router.get('/completed', fetchTodos, (req, res) => {
  res.locals.todos = res.locals.todos.filter((todo) => todo.completed);
  res.locals.filter = 'completed';
  res.render('index', { user: req.user });
});

router.post('/', (req, res, next) => {
  req.body.title = req.body.title.trim();
  next();
}, (req, res, next) => {
  if (req.body.title !== '') { return next(); }
  return res.redirect(`/${req.body.filter || ''}`);
}, async (req, res, next) => {
  try {
    const todo = await Todo.create({
      userId: req.user.id,
      title: req.body.title,
      completed: req.body.completed === true ? 1 : null,
    })
    return res.redirect(`/${req.body.filter || ''}`);
  } catch (e) {
    next(e);
  }
  // db.run('INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)', [
  //   req.user.id,
  //   req.body.title,
  //   req.body.completed === true ? 1 : null,
  // ], (err) => {
  //   if (err) { return next(err); }
  //   return res.redirect(`/${req.body.filter || ''}`);
  // });
});

router.post('/:id(\\d+)', (req, res, next) => {
  req.body.title = req.body.title.trim();
  next();
  // eslint-disable-next-line consistent-return
}, async (req, res, next) => {
  if (req.body.title !== '') { return next(); }
  const todo = await Todo.findByPk(req.params.id);
  if (todo === null) {
    return next(new Error('Todo not found'));
  }
  if (todo.userId !== req.user.id) {
    return next(new Error('Todo does not belong to correct user'));
  }

  try {
    await todo.destroy();
  } catch (e) {
    return next(e)
  }
  return res.redirect(`/${req.body.filter || ''}`);

  // old sqlite
  // db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
  //   req.params.id,
  //   req.user.id,
  // ], (err) => {
  //   if (err) { return next(err); }
  //   return res.redirect(`/${req.body.filter || ''}`);
  // });
}, async (req, res, next) => {

  const todo = await Todo.findByPk(req.params.id);
  if (todo === null) {
    return next(new Error('Todo not found'));
  }

  todo.title = req.body.title;
  todo.completed = req.body.completed !== undefined ? 1 : null;
  todo.id = req.params.id;
  todo.userId = req.user.id;
  try {
    await todo.save();
  } catch (e) {
    next(e);
  }
  return res.redirect(`/${req.body.filter || ''}`);

  // old mysql
  // db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?', [
  //   req.body.title,
  //   req.body.completed !== undefined ? 1 : null,
  //   req.params.id,
  //   req.user.id,
  // ], (err) => {
  //   if (err) { return next(err); }
  //   return res.redirect(`/${req.body.filter || ''}`);
  // });
});

router.post('/:id(\\d+)/delete', async (req, res, next) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo === null) {
    return next(new Error('Todo not found'));
  }
  if (todo.userId !== req.user.id) {
    return next(new Error('Todo does not belong to correct user'));
  }

  try {
    await todo.destroy();
  } catch (e) {
    next(e);
  }
  return res.redirect(`/${req.body.filter || ''}`);

  //sqlite
  // db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
  //   req.params.id,
  //   req.user.id,
  // ], (err) => {
  //   if (err) { return next(err); }
  //   return res.redirect(`/${req.body.filter || ''}`);
  // });
});

router.post('/toggle-all', async (req, res, next) => {
  try {
    await Todo.update({ completed: req.body.completed !== undefined ? 1 : null }, {
      where: {
        userId: req.user.id,
      }
    });
  } catch (e) {
    return next(e);
  }
  return res.redirect(`/${req.body.filter || ''}`);

  // db.run('UPDATE todos SET completed = ? WHERE owner_id = ?', [
  //   req.body.completed !== undefined ? 1 : null,
  //   req.user.id,
  // ], (err) => {
  //   if (err) { return next(err); }
  //   return res.redirect(`/${req.body.filter || ''}`);
  // });
});

router.post('/clear-completed', async (req, res, next) => {
  try {
    await Todo.destroy({ where: { userId: req.user.id } });
  } catch (e) {
    next(e);
  }
  return res.redirect(`/${req.body.filter || ''}`);

  // db.run('DELETE FROM todos WHERE owner_id = ? AND completed = ?', [
  //   req.user.id,
  //   1,
  // ], (err) => {
  //   if (err) { return next(err); }
  //   return res.redirect(`/${req.body.filter || ''}`);
  // });
});

export default router;
