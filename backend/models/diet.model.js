module.exports = (sequelize, Sequelize) => {
  const Diet = sequelize.define("diet", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    activity_level: {
      type: Sequelize.ENUM,
      values: ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'],
      allowNull: false
    },
    calories: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    protein_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    carbs_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    fat_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    last_updated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  });

  return Diet;
};