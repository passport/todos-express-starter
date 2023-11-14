import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../var', 'db', 'todos.db'),
});

import User from './user.js';
import Todo from './todo.js';

User(sequelize);
Todo(sequelize);

sequelize.models.user.hasMany(sequelize.models.todo);
sequelize.models.todo.belongsTo(sequelize.models.user);

export default sequelize;