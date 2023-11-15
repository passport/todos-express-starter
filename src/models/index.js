import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../var', 'db', 'todos.db'),
});

import user from './user.js';
import todo from './todo.js';

export const User = user(sequelize);
export const Todo = todo(sequelize);

User.hasMany(Todo);
Todo.belongsTo(User);

export default sequelize;