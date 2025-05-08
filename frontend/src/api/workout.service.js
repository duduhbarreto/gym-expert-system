import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/workouts/';

class WorkoutService {
  async getAll() {
    try {
      const response = await axios.get(API_URL, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getOne(id) {
    try {
      const response = await axios.get(API_URL + id, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRecommended() {
    try {
      const response = await axios.get(API_URL + 'recommended', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async create(workoutData) {
    try {
      const response = await axios.post(API_URL, workoutData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async update(id, workoutData) {
    try {
      const response = await axios.put(API_URL + id, workoutData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(API_URL + id, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new WorkoutService();