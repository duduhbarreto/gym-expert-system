import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import userService from '../api/user.service';

const validationSchema = Yup.object().shape({
  weight: Yup.number()
    .min(0, 'Peso inválido')
    .required('Peso é obrigatório'),
  height: Yup.number()
    .min(0, 'Altura inválida')
    .required('Altura é obrigatória'),
  goal: Yup.string()
    .required('Objetivo é obrigatório'),
  experience_level: Yup.string()
    .required('Nível de experiência é obrigatório')
});

const Profile = () => {
  const { currentUser, updateUserProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    lastMonth: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getStats();
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateProfile(values);
      
      if (response.success) {
        updateUserProfile(values);
        setMessage({ 
          type: 'success', 
          text: 'Perfil atualizado com sucesso!' 
        });
      } else {
        setMessage({ 
          type: 'danger', 
          text: response.message || 'Falha ao atualizar perfil.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Erro ao conectar ao servidor.' 
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body className="text-center">
            <p>Carregando perfil...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const getBMI = () => {
    if (!currentUser.weight || !currentUser.height) return 'N/A';
    
    const bmi = currentUser.weight / (currentUser.height * currentUser.height);
    return bmi.toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = getBMI();
    if (bmi === 'N/A') return 'N/A';
    
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    if (bmi < 35) return 'Obesidade Grau I';
    if (bmi < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Meu Perfil</h1>
      
      <Row>
        {/* User Stats */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Informações</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <div className="avatar-circle bg-primary text-white me-3">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="mb-0">{currentUser.name}</h5>
                  <p className="text-muted mb-0">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Dados Pessoais</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Idade</span>
                    <span className="badge bg-primary rounded-pill">{currentUser.age} anos</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Peso</span>
                    <span className="badge bg-primary rounded-pill">{currentUser.weight} kg</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Altura</span>
                    <span className="badge bg-primary rounded-pill">{currentUser.height} m</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>IMC</span>
                    <span className="badge bg-primary rounded-pill">{getBMI()} ({getBMICategory()})</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h6>Estatísticas de Treino</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Total de Treinos</span>
                    <span className="badge bg-secondary rounded-pill">{stats.totalWorkouts}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Último Mês</span>
                    <span className="badge bg-secondary rounded-pill">{stats.lastMonth}</span>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Update Profile Form */}
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Atualizar Perfil</h4>
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}
              
              <Formik
                initialValues={{
                  weight: currentUser.weight,
                  height: currentUser.height,
                  goal: currentUser.goal,
                  experience_level: currentUser.experience_level
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Peso (kg)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            name="weight"
                            value={values.weight}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.weight && errors.weight}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.weight}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Altura (m)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="height"
                            value={values.height}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.height && errors.height}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.height}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Objetivo</Form.Label>
                          <Form.Select
                            name="goal"
                            value={values.goal}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.goal && errors.goal}
                          >
                            <option value="Perda de peso">Perda de peso</option>
                            <option value="Hipertrofia">Hipertrofia</option>
                            <option value="Condicionamento">Condicionamento</option>
                            <option value="Definição">Definição</option>
                            <option value="Reabilitação">Reabilitação</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.goal}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nível de experiência</Form.Label>
                          <Form.Select
                            name="experience_level"
                            value={values.experience_level}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.experience_level && errors.experience_level}
                          >
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.experience_level}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Atualizando...
                          </>
                        ) : (
                          'Salvar Alterações'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;