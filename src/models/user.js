import { DataTypes, Model } from 'sequelize';

class User extends Model { }

export default (sequelize) => {
  User.init({
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hashedPassword: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
  }, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'user', // We need to choose the model name
  });

  return User;
};
