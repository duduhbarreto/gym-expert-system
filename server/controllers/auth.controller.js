const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;

exports.signup = async (req, res) => {
  try {
    // Create a new user
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      age: req.body.age,
      weight: req.body.weight,
      height: req.body.height,
      goal: req.body.goal,
      experience_level: req.body.experience_level
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao registrar o usuário',
      error: error.message
    });
  }
};

exports.signin = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Validate password
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Senha inválida'
      });
    }

    // Create a token
    const token = jwt.sign(
      { id: user.id },
      config.secret,
      { expiresIn: config.jwtExpiration }
    );

    // Return user information and token
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        experience_level: user.experience_level
      },
      token: token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao realizar login',
      error: error.message
    });
  }
};