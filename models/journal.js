// Creating the Journal model
// Journal model will have an associated user ID, a community shared selection, stringified list of objects names, right ascensions, and declinations, image link (future), simbad url (future), pointer color
module.exports = function (sequelize, DataTypes) {
  const Journal = sequelize.define("Journal", {
    title: {// title of journal
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    shared: {// shared with community
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    points: {// stringified position objects
      type: DataTypes.STRING(510),
    },
    color: {// rgb(255, 255, 255) 
      type: DataTypes.STRING,
    }
  });
  Journal.associate = function(models) {
    Journal.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  }
  return Journal;
};
