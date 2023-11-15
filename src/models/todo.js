import { DataTypes, Model } from 'sequelize';

class Todo extends Model { }

export default (sequelize) => {
  Todo.init({
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.TEXT,
    completed: DataTypes.BOOLEAN,
  }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'todo', // We need to choose the model name
  });

  return Todo;
};
