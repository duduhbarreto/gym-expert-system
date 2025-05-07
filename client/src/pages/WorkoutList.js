import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { WorkoutContext } from '../context/WorkoutContext';

const WorkoutList = () => {
  const { workouts, loading, fetchWorkouts } = useContext(WorkoutContext);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [filters, setFilters] = useState({
    goal: '',
    level: '',
    duration: ''
  });
  
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);
  
  useEffect(() => {
    filterWorkouts();
  }, [workouts, filters]);
  
  const filterWorkouts = () => {
    let filtered = [...workouts];
    
    if (filters.goal) {
      filtered = filtered.filter(workout => workout.goal === filters.goal);
    }
    
    if (filters.level) {
      filtered = filtered.filter(workout => workout.experience_level === filters.level);
    }
    
    if (filters.duration) {
      switch (filters.duration) {
        case 'short':
          filtered = filtered.filter(workout => workout.estimated_duration <= 30);
          break;
        case 'medium':
          filtered = filtered.filter(workout => workout.estimated_duration > 30 && workout.estimated_duration <= 60);
          break;
        case 'long':
          filtered = filtered.filter(workout => workout.estimated_duration > 60);
          break;
        default:
          break;
      }
    }
    
    setFilteredWorkouts(filtered);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      goal: '',
      level: '',
      duration: ''
    });
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Todos os Treinos</h1>
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Filtros</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Objetivo</Form.Label>
                <Form.Select 
                  name="goal"
                  value={filters.goal}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="Perda de peso">Perda de peso</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Condicionamento">Condicionamento</option>
                  <option value="Definição">Definição</option>
                  <option value="Reabilitação">Reabilitação</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Nível</Form.Label>
                <Form.Select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Duração</Form.Label>
                <Form.Select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="short">Curta (≤ 30 min)</option>
                  <option value="medium">Média (31-60 min)</option>
                  <option value="long">Longa (= 60 min)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                onClick={resetFilters}
                className="mb-3 w-100"
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Workouts Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Carregando treinos...</p>
        </div>
      ) : (
        <>
          {filteredWorkouts.length === 0 ? (
            <Card className="text-center p-5 shadow-sm">
              <Card.Body>
                <h4>Nenhum treino encontrado</h4>
                <p>Tente ajustar os filtros para encontrar treinos disponíveis.</p>
                <Button onClick={resetFilters} variant="primary">
                  Limpar Filtros
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredWorkouts.map((workout) => (
                <Col key={workout.id} lg={4} md={6} className="mb-4">
                  <Card className="h-100 shadow-sm workout-card">
                    <Card.Body>
                      <Card.Title>{workout.name}</Card.Title>
                      <div className="mb-2">
                        <Badge bg="primary" className="me-1">{workout.goal}</Badge>
                        <Badge bg="secondary" className="me-1">{workout.experience_level}</Badge>
                        <Badge bg="info">{workout.estimated_duration} min</Badge>
                      </div>
                      <Card.Text className="text-truncate">
                        {workout.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0">
                      <Button 
                        as={Link} 
                        to={`/workouts/${workout.id}`}
                        variant="outline-primary" 
                        className="w-100"
                      >
                        Ver Detalhes
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default WorkoutList;