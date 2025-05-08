const db = require('../models');
const Diet = db.diet;
const DietRestriction = db.dietRestriction;
const Food = db.food;
const User = db.user;

// Funções auxiliares para cálculos
const calculateBMR = (gender, weight, height, age) => {
  // Fórmula de Harris-Benedict para metabolismo basal
  if (gender === 'Masculino') {
    return 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);
  }
};

const getActivityMultiplier = (activityLevel) => {
  const multipliers = {
    'Sedentário': 1.2,
    'Levemente ativo': 1.375,
    'Moderadamente ativo': 1.55,
    'Muito ativo': 1.725,
    'Extremamente ativo': 1.9
  };
  return multipliers[activityLevel] || 1.2;
};

const calculateMacrosByGoal = (totalCalories, goal, weight) => {
  let protein, carbs, fat;
  
  switch (goal) {
    case 'Hipertrofia':
      protein = weight * 2.0; // 2g por kg de peso corporal
      fat = (totalCalories * 0.25) / 9; // 25% das calorias como gordura
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
    case 'Perda de peso':
      protein = weight * 2.2; // 2.2g por kg para preservar massa muscular
      fat = (totalCalories * 0.3) / 9; // 30% das calorias como gordura
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
    case 'Definição':
      protein = weight * 2.0;
      fat = (totalCalories * 0.25) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
    case 'Condicionamento':
      protein = weight * 1.6;
      fat = (totalCalories * 0.25) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
    case 'Reabilitação':
      protein = weight * 1.8;
      fat = (totalCalories * 0.3) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
    default: // Manutenção
      protein = weight * 1.6;
      fat = (totalCalories * 0.3) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
  }
  
  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};

// Calcular dieta do usuário
exports.calculateDiet = async (req, res) => {
  try {
    const userId = req.userId;
    const { activity_level, gender } = req.body;
    
    // Obter dados do usuário
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Calcular necessidades calóricas
    const bmr = calculateBMR(gender || 'Masculino', user.weight, user.height, user.age);
    const activityMultiplier = getActivityMultiplier(activity_level);
    let totalCalories = Math.round(bmr * activityMultiplier);
    
    // Ajustar calorias com base no objetivo
    switch(user.goal) {
      case 'Perda de peso':
        totalCalories -= 500; // Déficit calórico
        break;
      case 'Hipertrofia':
        totalCalories += 300; // Superávit calórico
        break;
      // Outros objetivos mantêm as calorias calculadas
    }
    
    // Calcular macronutrientes
    const macros = calculateMacrosByGoal(totalCalories, user.goal, user.weight);
    
    // Verificar se o usuário já tem uma dieta
    let diet = await Diet.findOne({ where: { user_id: userId } });
    
    if (diet) {
      // Atualizar dieta existente
      await Diet.update({
        activity_level: activity_level,
        calories: totalCalories,
        protein_g: macros.protein,
        carbs_g: macros.carbs,
        fat_g: macros.fat,
        last_updated: new Date()
      }, { where: { user_id: userId } });
    } else {
      // Criar nova dieta
      diet = await Diet.create({
        user_id: userId,
        activity_level: activity_level,
        calories: totalCalories,
        protein_g: macros.protein,
        carbs_g: macros.carbs,
        fat_g: macros.fat
      });
    }
    
    // Buscar dieta atualizada
    const updatedDiet = await Diet.findOne({ 
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['name', 'goal', 'weight', 'height', 'age']
      }]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Dieta calculada com sucesso',
      diet: updatedDiet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao calcular dieta',
      error: error.message
    });
  }
};

// Obter dieta do usuário
exports.getDiet = async (req, res) => {
  try {
    const userId = req.userId;
    
    const diet = await Diet.findOne({ 
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['name', 'goal', 'weight', 'height', 'age']
      }]
    });
    
    if (!diet) {
      return res.status(404).json({
        success: false,
        message: 'Dieta não encontrada para este usuário'
      });
    }
    
    return res.status(200).json({
      success: true,
      diet: diet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar dieta',
      error: error.message
    });
  }
};

// Salvar restrição alimentar
exports.saveRestriction = async (req, res) => {
  try {
    const userId = req.userId;
    const { restriction_type, description } = req.body;
    
    const restriction = await DietRestriction.create({
      user_id: userId,
      restriction_type,
      description
    });
    
    return res.status(201).json({
      success: true,
      message: 'Restrição alimentar adicionada com sucesso',
      restriction
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar restrição alimentar',
      error: error.message
    });
  }
};

// Buscar restrições do usuário
exports.getRestrictions = async (req, res) => {
  try {
    const userId = req.userId;
    
    const restrictions = await DietRestriction.findAll({
      where: { user_id: userId }
    });
    
    return res.status(200).json({
      success: true,
      restrictions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar restrições alimentares',
      error: error.message
    });
  }
};

// Remover restrição
exports.deleteRestriction = async (req, res) => {
  try {
    const userId = req.userId;
    const restrictionId = req.params.id;
    
    const result = await DietRestriction.destroy({
      where: {
        id: restrictionId,
        user_id: userId
      }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restrição não encontrada ou não pertence a este usuário'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Restrição alimentar removida com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao remover restrição alimentar',
      error: error.message
    });
  }
};

// Obter sugestões de alimentos
exports.getFoodSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Buscar dieta do usuário
    const diet = await Diet.findOne({ where: { user_id: userId } });
    
    if (!diet) {
      return res.status(404).json({
        success: false,
        message: 'Dieta não encontrada. Por favor, calcule sua dieta primeiro.'
      });
    }
    
    // Buscar restrições do usuário
    const restrictions = await DietRestriction.findAll({
      where: { user_id: userId }
    });
    
    // Restrições como array de strings para facilitar a filtragem
    const restrictionTexts = restrictions.map(r => r.description.toLowerCase());
    
    // Buscar alimentos por categoria
    const proteinFoods = await Food.findAll({ 
      where: { category: 'Proteína' },
      limit: 10
    });
    
    const carbFoods = await Food.findAll({ 
      where: { category: 'Carboidrato' },
      limit: 10
    });
    
    const fatFoods = await Food.findAll({ 
      where: { category: 'Gordura' },
      limit: 5
    });
    
    const vegetables = await Food.findAll({ 
      where: { category: 'Vegetal' },
      limit: 8
    });
    
    const fruits = await Food.findAll({ 
      where: { category: 'Fruta' },
      limit: 5
    });
    
    // Filtrar alimentos com base nas restrições
    const filterByRestrictions = (foodList) => {
      return foodList.filter(food => {
        return !restrictionTexts.some(restriction => 
          food.name.toLowerCase().includes(restriction));
      });
    };
    
    // Filtrar cada categoria
    const filteredProtein = filterByRestrictions(proteinFoods);
    const filteredCarbs = filterByRestrictions(carbFoods);
    const filteredFats = filterByRestrictions(fatFoods);
    const filteredVegetables = filterByRestrictions(vegetables);
    const filteredFruits = filterByRestrictions(fruits);
    
    // Preparar as sugestões de refeições
    const mealSuggestions = {
      cafe_da_manha: {
        name: "Café da manhã",
        options: [
          {
            name: "Opção 1",
            foods: [
              filteredProtein.length > 0 ? filteredProtein[0].name : "Ovos mexidos",
              filteredCarbs.length > 0 ? filteredCarbs[0].name : "Pão integral",
              filteredFruits.length > 0 ? filteredFruits[0].name : "Banana"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.25),
              protein: Math.round(diet.protein_g * 0.2),
              carbs: Math.round(diet.carbs_g * 0.25),
              fat: Math.round(diet.fat_g * 0.2)
            }
          },
          {
            name: "Opção 2",
            foods: [
              "Iogurte natural",
              filteredFruits.length > 1 ? filteredFruits[1].name : "Maçã",
              filteredCarbs.length > 1 ? filteredCarbs[1].name : "Aveia"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.25),
              protein: Math.round(diet.protein_g * 0.2),
              carbs: Math.round(diet.carbs_g * 0.25),
              fat: Math.round(diet.fat_g * 0.2)
            }
          }
        ]
      },
      almoco: {
        name: "Almoço",
        options: [
          {
            name: "Opção 1",
            foods: [
              filteredProtein.length > 1 ? filteredProtein[1].name : "Peito de frango",
              filteredCarbs.length > 2 ? filteredCarbs[2].name : "Arroz integral",
              filteredVegetables.length > 0 ? filteredVegetables[0].name : "Brócolis"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.35),
              protein: Math.round(diet.protein_g * 0.4),
              carbs: Math.round(diet.carbs_g * 0.35),
              fat: Math.round(diet.fat_g * 0.3)
            }
          },
          {
            name: "Opção 2",
            foods: [
              filteredProtein.length > 2 ? filteredProtein[2].name : "Peixe grelhado",
              filteredCarbs.length > 3 ? filteredCarbs[3].name : "Batata doce",
              filteredVegetables.length > 1 ? filteredVegetables[1].name : "Salada verde"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.35),
              protein: Math.round(diet.protein_g * 0.4),
              carbs: Math.round(diet.carbs_g * 0.35),
              fat: Math.round(diet.fat_g * 0.3)
            }
          }
        ]
      },
      jantar: {
        name: "Jantar",
        options: [
          {
            name: "Opção 1",
            foods: [
              filteredProtein.length > 3 ? filteredProtein[3].name : "Carne magra",
              filteredCarbs.length > 4 ? filteredCarbs[4].name : "Macarrão integral",
              filteredVegetables.length > 2 ? filteredVegetables[2].name : "Espinafre"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.3),
              protein: Math.round(diet.protein_g * 0.3),
              carbs: Math.round(diet.carbs_g * 0.3),
              fat: Math.round(diet.fat_g * 0.3)
            }
          },
          {
            name: "Opção 2",
            foods: [
              filteredProtein.length > 4 ? filteredProtein[4].name : "Tofu",
              filteredCarbs.length > 5 ? filteredCarbs[5].name : "Quinoa",
              filteredVegetables.length > 3 ? filteredVegetables[3].name : "Cenoura"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.3),
              protein: Math.round(diet.protein_g * 0.3),
              carbs: Math.round(diet.carbs_g * 0.3),
              fat: Math.round(diet.fat_g * 0.3)
            }
          }
        ]
      },
      snacks: {
        name: "Lanches",
        options: [
          {
            name: "Lanche da manhã",
            foods: [
              filteredFruits.length > 2 ? filteredFruits[2].name : "Maçã",
              "Whey protein",
              filteredFats.length > 0 ? filteredFats[0].name : "Amêndoas"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.1),
              protein: Math.round(diet.protein_g * 0.1),
              carbs: Math.round(diet.carbs_g * 0.1),
              fat: Math.round(diet.fat_g * 0.1)
            }
          },
          {
            name: "Lanche da tarde",
            foods: [
              "Iogurte grego",
              filteredFruits.length > 3 ? filteredFruits[3].name : "Morango",
              filteredFats.length > 1 ? filteredFats[1].name : "Castanhas"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.1),
              protein: Math.round(diet.protein_g * 0.1),
              carbs: Math.round(diet.carbs_g * 0.1),
              fat: Math.round(diet.fat_g * 0.1)
            }
          }
        ]
      }
    };
    
    return res.status(200).json({
      success: true,
      diet: diet,
      foodSuggestions: {
        proteins: filteredProtein,
        carbs: filteredCarbs,
        fats: filteredFats,
        vegetables: filteredVegetables,
        fruits: filteredFruits
      },
      mealSuggestions: mealSuggestions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar sugestões de alimentos',
      error: error.message
    });
  }
};