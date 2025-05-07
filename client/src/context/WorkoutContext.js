import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import workoutService from '../api/workout.service';
import historyService from '../api/history.service';
import { AuthContext } from './AuthContext';

export const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load workouts when user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchWorkouts();
      fetchRecommendedWorkout();
      fetchWorkoutHistory();
    }
  }, [currentUser]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getAll();
      if (response.success) {
        setWorkouts(response.workouts);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Erro ao carregar treinos');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedWorkout = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getRecommended();
      if (response.success) {
        setRecommendedWorkout(response.workout);
      }
    } catch (error) {
      console.error('Error fetching recommended workout:', error);
      toast.error('Erro ao carregar treino recomendado');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      setLoading(true);
      const response = await historyService.getAll();
      if (response.success) {
        setWorkoutHistory(response.history);
      }
    } catch (error) {
      console.error('Error fetching workout history:', error);
      toast.error('Erro ao carregar histórico de treinos');
    } finally {
      setLoading(false);
    }
  };

  const getWorkout = async (id) => {
    try {
      setLoading(true);
      const response = await workoutService.getOne(id);
      return response;
    } catch (error) {
      console.error('Error fetching workout:', error);
      toast.error('Erro ao carregar detalhes do treino');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const recordWorkout = async (workoutId, feedback, notes) => {
    try {
      setLoading(true);
      const historyData = {
        workout_id: workoutId,
        feedback: feedback,
        notes: notes
      };

      const response = await historyService.create(historyData);
      
      if (response.success) {
        // Refresh workout history
        fetchWorkoutHistory();
        toast.success('Treino registrado com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Falha ao registrar treino');
        return false;
      }
    } catch (error) {
      console.error('Error recording workout:', error);
      toast.error('Erro ao registrar treino');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        recommendedWorkout,
        workoutHistory,
        loading,
        fetchWorkouts,
        fetchRecommendedWorkout,
        fetchWorkoutHistory,
        getWorkout,
        recordWorkout
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};