const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const WorkoutHistory = db.history;
const Sequelize = db.Sequelize;
const Op = db.Sequelize.Op;

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Update user data
    const result = await User.update(
      {
        weight: req.body.weight,
        height: req.body.height,
        goal: req.body.goal,
        experience_level: req.body.experience_level
      },
      {
        where: { id: userId }
      }
    );
    
    if (result[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado ou nenhum campo foi alterado'
      });
    }
    
    // Get updated user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Check current password
    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }
    
    // Update password
    await User.update(
      {
        password: bcrypt.hashSync(newPassword, 8)
      },
      {
        where: { id: userId }
      }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: error.message
    });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get total workouts count
    const totalWorkouts = await WorkoutHistory.count({
      where: { user_id: userId }
    });
    
    // Get workouts in the last 30 days
    const lastMonth = await WorkoutHistory.count({
      where: {
        user_id: userId,
        workout_date: {
          [Op.gte]: Sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
        }
      }
    });
    
    // Get streak (consecutive days)
    // This is a simplified version - a more sophisticated calculation would be needed for a real app
    const workoutDates = await WorkoutHistory.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('workout_date')), 'date']
      ],
      where: { user_id: userId },
      order: [['workout_date', 'DESC']],
      raw: true
    });
    
    let streak = 0;
    if (workoutDates.length > 0) {
      // Check if the most recent workout was today
      const today = new Date();
      const mostRecentDate = new Date(workoutDates[0].date);
      
      if (today.toDateString() === mostRecentDate.toDateString()) {
        streak = 1;
        
        // Check for consecutive days
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        for (let i = 1; i < workoutDates.length; i++) {
          const currentDate = new Date(workoutDates[i].date);
          if (yesterday.toDateString() === currentDate.toDateString()) {
            streak++;
            yesterday.setDate(yesterday.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        lastMonth,
        streak
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
};