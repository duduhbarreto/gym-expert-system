require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcryptjs');

// Models
const User = db.user;
const MuscleGroup = db.muscleGroup;
const Exercise = db.exercise;
const Workout = db.workout;
const WorkoutExercise = db.workoutExercise;

// Function to initialize the database
async function initDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Sync all models with database (force: true will drop tables if they exist)
    console.log('Syncing database models...');
    await db.sequelize.sync({ force: true });
    console.log('Database synced successfully!');
    
    // Seed muscle groups
    console.log('Seeding muscle groups...');
    const muscleGroups = await MuscleGroup.bulkCreate([
      { name: 'Peito' },
      { name: 'Costas' },
      { name: 'Ombros' },
      { name: 'Bíceps' },
      { name: 'Tríceps' },
      { name: 'Pernas' },
      { name: 'Abdômen' },
      { name: 'Glúteos' },
      { name: 'Panturrilha' },
      { name: 'Antebraço' }
    ]);
    console.log(`${muscleGroups.length} muscle groups created.`);
    
    // Seed exercises
    console.log('Seeding exercises...');
    const exercises = await Exercise.bulkCreate([
      {
        name: 'Supino Reto',
        description: 'Exercício para desenvolvimento do peitoral utilizando barra e banco reto.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroups[0].id // Peito
      },
      {
        name: 'Agachamento',
        description: 'Exercício para desenvolvimento de quadríceps, glúteos e fortalecimento de core.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroups[5].id // Pernas
      },
      {
        name: 'Puxada Alta',
        description: 'Exercício para desenvolvimento das costas, com foco no latíssimo do dorso.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroups[1].id // Costas
      },
      {
        name: 'Desenvolvimento com Halteres',
        description: 'Exercício para desenvolvimento dos ombros.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroups[2].id // Ombros
      },
      {
        name: 'Rosca Direta',
        description: 'Exercício isolado para desenvolvimento dos bíceps.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroups[3].id // Bíceps
      },
      {
        name: 'Tríceps Corda',
        description: 'Exercício isolado para desenvolvimento da cabeça lateral do tríceps.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroups[4].id // Tríceps
      },
      {
        name: 'Abdominal Reto',
        description: 'Exercício para fortalecimento do abdômen.',
        difficulty_level: 'Fácil',
        equipment_required: false,
        muscle_group_id: muscleGroups[6].id // Abdômen
      },
      {
        name: 'Elevação Pélvica',
        description: 'Exercício para fortalecimento dos glúteos e posterior da coxa.',
        difficulty_level: 'Fácil',
        equipment_required: false,
        muscle_group_id: muscleGroups[7].id // Glúteos
      },
      {
        name: 'Elevação de Panturrilha',
        description: 'Exercício para desenvolvimento das panturrilhas.',
        difficulty_level: 'Fácil',
        equipment_required: false,
        muscle_group_id: muscleGroups[8].id // Panturrilha
      },
      {
        name: 'Flexão de Punho',
        description: 'Exercício para fortalecimento dos músculos do antebraço.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroups[9].id // Antebraço
      }
    ]);
    console.log(`${exercises.length} exercises created.`);

    // Create sample workouts
    console.log('Creating sample workouts...');
    const workouts = await Workout.bulkCreate([
      {
        name: 'Treino Iniciante Full Body',
        description: 'Treino completo para iniciantes, focado em todos os grupos musculares principais.',
        goal: 'Condicionamento',
        experience_level: 'Iniciante',
        estimated_duration: 45
      },
      {
        name: 'Treino de Hipertrofia A',
        description: 'Treino focado em ganho de massa muscular para superiores (peito, costas e ombros).',
        goal: 'Hipertrofia',
        experience_level: 'Intermediário',
        estimated_duration: 60
      },
      {
        name: 'Treino de Hipertrofia B',
        description: 'Treino focado em ganho de massa muscular para inferiores (pernas e glúteos).',
        goal: 'Hipertrofia',
        experience_level: 'Intermediário',
        estimated_duration: 60
      },
      {
        name: 'Treino de Definição',
        description: 'Treino com maior número de repetições e menor intervalo para definição muscular.',
        goal: 'Definição',
        experience_level: 'Avançado',
        estimated_duration: 50
      },
      {
        name: 'Treino para Perda de Peso',
        description: 'Treino com exercícios compostos e alta intensidade para maximizar o gasto calórico.',
        goal: 'Perda de peso',
        experience_level: 'Iniciante',
        estimated_duration: 40
      }
    ]);
    console.log(`${workouts.length} workouts created.`);

    // Associate workouts with exercises
    console.log('Creating workout-exercise associations...');
    
    // Workout 1: Iniciante Full Body
    await WorkoutExercise.bulkCreate([
      { workout_id: workouts[0].id, exercise_id: exercises[1].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }, // Agachamento
      { workout_id: workouts[0].id, exercise_id: exercises[0].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }, // Supino
      { workout_id: workouts[0].id, exercise_id: exercises[2].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }, // Puxada
      { workout_id: workouts[0].id, exercise_id: exercises[6].id, sets: 3, repetitions: '15,15,15', rest_time: 45 }  // Abdominal
    ]);

    // Workout 2: Hipertrofia A
    await WorkoutExercise.bulkCreate([
      { workout_id: workouts[1].id, exercise_id: exercises[0].id, sets: 4, repetitions: '12,10,8,8', rest_time: 90 },  // Supino
      { workout_id: workouts[1].id, exercise_id: exercises[2].id, sets: 4, repetitions: '12,10,8,8', rest_time: 90 },  // Puxada
      { workout_id: workouts[1].id, exercise_id: exercises[3].id, sets: 3, repetitions: '12,10,10', rest_time: 60 },   // Desenvolvimento
      { workout_id: workouts[1].id, exercise_id: exercises[4].id, sets: 3, repetitions: '12,10,10', rest_time: 60 },   // Rosca
      { workout_id: workouts[1].id, exercise_id: exercises[5].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }    // Tríceps
    ]);

    // Workout 3: Hipertrofia B
    await WorkoutExercise.bulkCreate([
      { workout_id: workouts[2].id, exercise_id: exercises[1].id, sets: 4, repetitions: '12,10,8,8', rest_time: 90 },  // Agachamento
      { workout_id: workouts[2].id, exercise_id: exercises[7].id, sets: 4, repetitions: '15,15,15,15', rest_time: 60 }, // Elevação Pélvica
      { workout_id: workouts[2].id, exercise_id: exercises[8].id, sets: 4, repetitions: '20,20,20,20', rest_time: 45 }, // Panturrilha
      { workout_id: workouts[2].id, exercise_id: exercises[6].id, sets: 4, repetitions: '20,20,20,20', rest_time: 45 }  // Abdominal
    ]);

    // Workout 4: Definição
    await WorkoutExercise.bulkCreate([
      { workout_id: workouts[3].id, exercise_id: exercises[0].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Supino
      { workout_id: workouts[3].id, exercise_id: exercises[1].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Agachamento
      { workout_id: workouts[3].id, exercise_id: exercises[2].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Puxada
      { workout_id: workouts[3].id, exercise_id: exercises[3].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Desenvolvimento
      { workout_id: workouts[3].id, exercise_id: exercises[6].id, sets: 4, repetitions: '20,20,20,20', rest_time: 30 }  // Abdominal
    ]);

    // Workout 5: Perda de Peso
    await WorkoutExercise.bulkCreate([
      { workout_id: workouts[4].id, exercise_id: exercises[1].id, sets: 3, repetitions: '15,15,15', rest_time: 30 }, // Agachamento
      { workout_id: workouts[4].id, exercise_id: exercises[0].id, sets: 3, repetitions: '15,15,15', rest_time: 30 }, // Supino
      { workout_id: workouts[4].id, exercise_id: exercises[2].id, sets: 3, repetitions: '15,15,15', rest_time: 30 }, // Puxada
      { workout_id: workouts[4].id, exercise_id: exercises[6].id, sets: 3, repetitions: '20,20,20', rest_time: 30 }, // Abdominal
      { workout_id: workouts[4].id, exercise_id: exercises[8].id, sets: 3, repetitions: '20,20,20', rest_time: 30 }  // Panturrilha
    ]);

    console.log('Workout-exercise associations created.');

    // Create admin user
    console.log('Creating admin user...');
    await User.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456', 8),
      age: 30,
      weight: 70,
      height: 1.75,
      goal: 'Condicionamento',
      experience_level: 'Intermediário'
    });
    console.log('Admin user created.');

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    process.exit();
  }
}

// Run the initialization
initDatabase();