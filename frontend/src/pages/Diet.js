import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge, Tabs, Tab, Modal, ListGroup } from 'react-bootstrap';
import { FaUtensils, FaWeightHanging, FaAppleAlt, FaBreadSlice, FaFish, FaBan, FaPizzaSlice, FaChartPie, FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import dietService from '../api/diet.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registrar os elementos necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const Diet = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [diet, setDiet] = useState(null);
  const [foodSuggestions, setFoodSuggestions] = useState(null);
  const [mealSuggestions, setMealSuggestions] = useState(null);
  const [restrictions, setRestrictions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const chartRef = useRef(null);
  
  // Modal states
  const [showDietModal, setShowDietModal] = useState(false);
  const [activityLevel, setActivityLevel] = useState('Moderadamente ativo');
  const [gender, setGender] = useState('Masculino');
  
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionType, setRestrictionType] = useState('Alergia');
  const [restrictionDescription, setRestrictionDescription] = useState('');
  
  // Buscar dados do usuário ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tentar obter dieta existente
        const dietResponse = await dietService.getDiet();
        if (dietResponse.success) {
          setDiet(dietResponse.diet);
          
          // Buscar sugestões de alimentos
          const suggestionsResponse = await dietService.getFoodSuggestions();
          if (suggestionsResponse.success) {
            setFoodSuggestions(suggestionsResponse.foodSuggestions);
            setMealSuggestions(suggestionsResponse.mealSuggestions);
          }
        }
        
        // Buscar restrições alimentares
        const restrictionsResponse = await dietService.getRestrictions();
        if (restrictionsResponse.success) {
          setRestrictions(restrictionsResponse.restrictions);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          toast.error('Erro ao carregar dados da dieta');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculadora de macros para o gráfico
  const calculateMacroCalories = () => {
    if (!diet) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round(diet.protein_g * 4), // 4 calorias por grama de proteína
      carbs: Math.round(diet.carbs_g * 4),    // 4 calorias por grama de carboidrato
      fat: Math.round(diet.fat_g * 9)         // 9 calorias por grama de gordura
    };
  };
  
  // Dados para o gráfico de macronutrientes
  const getChartData = () => {
    const macroCalories = calculateMacroCalories();
    
    return {
      labels: ['Proteínas', 'Carboidratos', 'Gorduras'],
      datasets: [
        {
          data: [macroCalories.protein, macroCalories.carbs, macroCalories.fat],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF5371', '#319DE4', '#FFBD45'],
        }
      ]
    };
  };
  
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} kcal (${percentage}%)`;
          }
        }
      }
    }
  };
  
  // Calcular nova dieta
  const handleCalculateDiet = async () => {
    setCalculating(true);
    try {
      const response = await dietService.calculateDiet(activityLevel, gender);
      if (response.success) {
        setDiet(response.diet);
        toast.success('Dieta calculada com sucesso!');
        
        // Buscar sugestões atualizadas
        const suggestionsResponse = await dietService.getFoodSuggestions();
        if (suggestionsResponse.success) {
          setFoodSuggestions(suggestionsResponse.foodSuggestions);
          setMealSuggestions(suggestionsResponse.mealSuggestions);
        }
        
        setShowDietModal(false);
      } else {
        toast.error(response.message || 'Erro ao calcular dieta');
      }
    } catch (error) {
      toast.error('Erro ao comunicar com o servidor');
    } finally {
      setCalculating(false);
    }
  };
  
  // Adicionar restrição alimentar
  const handleAddRestriction = async () => {
    if (!restrictionDescription.trim()) {
      toast.warning('Por favor, informe a descrição da restrição');
      return;
    }
    
    try {
      const response = await dietService.addRestriction({
        restriction_type: restrictionType,
        description: restrictionDescription
      });
      
      if (response.success) {
        toast.success('Restrição alimentar adicionada com sucesso!');
        setRestrictions([...restrictions, response.restriction]);
        setRestrictionDescription('');
        setShowRestrictionModal(false);
        
        // Atualizar sugestões de alimentos
        const suggestionsResponse = await dietService.getFoodSuggestions();
        if (suggestionsResponse.success) {
          setFoodSuggestions(suggestionsResponse.foodSuggestions);
          setMealSuggestions(suggestionsResponse.mealSuggestions);
        }
      }
    } catch (error) {
      toast.error('Erro ao adicionar restrição alimentar');
    }
  };
  
  // Remover restrição
  const handleRemoveRestriction = async (id) => {
    try {
      const response = await dietService.deleteRestriction(id);
      if (response.success) {
        toast.success('Restrição removida com sucesso');
        setRestrictions(restrictions.filter(r => r.id !== id));
        
        // Atualizar sugestões de alimentos
        const suggestionsResponse = await dietService.getFoodSuggestions();
        if (suggestionsResponse.success) {
          setFoodSuggestions(suggestionsResponse.foodSuggestions);
          setMealSuggestions(suggestionsResponse.mealSuggestions);
        }
      }
    } catch (error) {
      toast.error('Erro ao remover restrição');
    }
  };
  
  // Formatador para valores nutricionais
  const formatNutrient = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
  };
  
  // Renderizar cálculo de calorias por macronutriente
  const renderMacroCalories = () => {
    const macroCalories = calculateMacroCalories();
    const totalCals = diet ? diet.calories : 0;
    
    return (
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Proteínas</h6>
                <Badge bg="danger" className="p-2">{diet ? Math.round((macroCalories.protein / totalCals) * 100) : 0}%</Badge>
              </div>
              <h3 className="mt-2">{formatNutrient(macroCalories.protein)} kcal</h3>
              <p className="text-muted">{formatNutrient(diet?.protein_g)} g</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Carboidratos</h6>
                <Badge bg="primary" className="p-2">{diet ? Math.round((macroCalories.carbs / totalCals) * 100) : 0}%</Badge>
              </div>
              <h3 className="mt-2">{formatNutrient(macroCalories.carbs)} kcal</h3>
              <p className="text-muted">{formatNutrient(diet?.carbs_g)} g</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Gorduras</h6>
                <Badge bg="warning" className="p-2">{diet ? Math.round((macroCalories.fat / totalCals) * 100) : 0}%</Badge>
              </div>
              <h3 className="mt-2">{formatNutrient(macroCalories.fat)} kcal</h3>
              <p className="text-muted">{formatNutrient(diet?.fat_g)} g</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  // Renderizar seção de restrições alimentares
  const renderRestrictions = () => {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Restrições Alimentares</h5>
          <Button size="sm" variant="light" onClick={() => setShowRestrictionModal(true)}>
            <FaPlus className="me-1" /> Adicionar
          </Button>
        </Card.Header>
        <Card.Body>
          {restrictions.length === 0 ? (
            <p className="text-center">Nenhuma restrição alimentar cadastrada</p>
          ) : (
            <ListGroup variant="flush">
              {restrictions.map(restriction => (
                <ListGroup.Item key={restriction.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <Badge bg={
                      restriction.restriction_type === 'Alergia' ? 'danger' :
                      restriction.restriction_type === 'Intolerância' ? 'warning' :
                      restriction.restriction_type === 'Preferência' ? 'info' : 'secondary'
                    } className="me-2">
                      {restriction.restriction_type}
                    </Badge>
                    {restriction.description}
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveRestriction(restriction.id)}
                  >
                    <FaTrash />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  // Renderizar sugestões de alimentos
  const renderFoodSuggestions = () => {
    if (!foodSuggestions) return null;
    
    const sections = [
      { title: 'Proteínas', data: foodSuggestions.proteins, icon: <FaFish className="me-2" /> },
      { title: 'Carboidratos', data: foodSuggestions.carbs, icon: <FaBreadSlice className="me-2" /> },
      { title: 'Gorduras', data: foodSuggestions.fats, icon: <FaWeightHanging className="me-2" /> },
      { title: 'Vegetais', data: foodSuggestions.vegetables, icon: <FaAppleAlt className="me-2" /> },
      { title: 'Frutas', data: foodSuggestions.fruits, icon: <FaAppleAlt className="me-2" /> }
    ];
    
    return (
      <div className="mb-4">
        <h4 className="mb-3">Sugestões de Alimentos</h4>
        <p className="text-muted">Baseado nas suas preferências e restrições alimentares</p>
        
        <Row>
          {sections.map((section, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-light">
                  <h5 className="mb-0 d-flex align-items-center">
                    {section.icon}
                    {section.title}
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    {section.data && section.data.length > 0 ? (
                      section.data.slice(0, 5).map((food, i) => (
                        <ListGroup.Item key={i} className="px-0">
                          <div className="d-flex justify-content-between">
                            <span>{food.name}</span>
                            <span className="text-muted">{food.calories_per_100g} kcal/100g</span>
                          </div>
                          <div className="small text-muted">
                            P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fat_per_100g}g
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p className="text-center">Nenhum alimento disponível</p>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // Renderizar sugestões de refeições
  const renderMealSuggestions = () => {
    if (!mealSuggestions) return null;
    
    return (
      <div className="mb-4">
        <h4 className="mb-3">Sugestões de Refeições Diárias</h4>
        <p className="text-muted">Plano alimentar baseado na sua dieta calculada</p>
        
        <div className="accordion" id="mealAccordion">
          {Object.keys(mealSuggestions).map((mealKey, index) => {
            const meal = mealSuggestions[mealKey];
            return (
              <div className="accordion-item mb-3 shadow-sm" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button 
                    className="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target={`#collapse${index}`} 
                    aria-expanded="false" 
                    aria-controls={`collapse${index}`}
                  >
                    <span className="d-flex align-items-center">
                      <FaUtensils className="me-2" />
                      <strong>{meal.name}</strong>
                    </span>
                  </button>
                </h2>
                <div 
                  id={`collapse${index}`} 
                  className="accordion-collapse collapse" 
                  aria-labelledby={`heading${index}`} 
                  data-bs-parent="#mealAccordion"
                >
                  <div className="accordion-body">
                    <Tabs defaultActiveKey="option1" id={`meal-tabs-${index}`}>
                      {meal.options.map((option, optIndex) => (
                        <Tab eventKey={`option${optIndex + 1}`} title={option.name} key={optIndex}>
                          <div className="p-3">
                            <h6>Alimentos Sugeridos:</h6>
                            <ul className="mb-4">
                              {option.foods.map((food, foodIndex) => (
                                <li key={foodIndex}>{food}</li>
                              ))}
                            </ul>
                            
                            <h6>Macronutrientes:</h6>
                            <div className="d-flex flex-wrap">
                              <Badge bg="secondary" className="me-2 mb-2 p-2">
                                Calorias: {option.macros.calories} kcal
                              </Badge>
                              <Badge bg="danger" className="me-2 mb-2 p-2">
                                Proteínas: {option.macros.protein}g
                              </Badge>
                              <Badge bg="primary" className="me-2 mb-2 p-2">
                                Carboidratos: {option.macros.carbs}g
                              </Badge>
                              <Badge bg="warning" className="me-2 mb-2 p-2">
                                Gorduras: {option.macros.fat}g
                              </Badge>
                            </div>
                          </div>
                        </Tab>
                      ))}
                    </Tabs>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Componente para o gráfico de macronutrientes
  const MacroNutrientChart = () => {
    const chartContainer = useRef(null);
    const chartInstance = useRef(null);
    
    useEffect(() => {
      // Destruir gráfico anterior se existir
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Garantir que o container existe e temos dados de dieta
      if (chartContainer.current && diet) {
        const ctx = chartContainer.current.getContext('2d');
        
        // Criar novo gráfico
        chartInstance.current = new ChartJS(ctx, {
          type: 'doughnut',
          data: getChartData(),
          options: chartOptions
        });
      }
      
      // Cleanup ao desmontar
      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [diet]); // Recriar gráfico quando os dados da dieta mudarem
    
    return (
      <div style={{ height: '300px', position: 'relative' }}>
        <canvas ref={chartContainer} />
      </div>
    );
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando dados da dieta...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Plano Alimentar</h1>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={() => setShowRestrictionModal(true)}>
            <FaBan className="me-2" />
            Restrições
          </Button>
          <Button variant="primary" onClick={() => setShowDietModal(true)}>
            <FaUtensils className="me-2" />
            Calcular Dieta
          </Button>
        </div>
      </div>
      
      {!diet ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <FaPizzaSlice size={60} className="text-primary mb-3" />
            <h3>Você ainda não tem uma dieta calculada</h3>
            <p className="text-muted mb-4">
              Calcule sua dieta personalizada com base no seu objetivo, peso, altura e nível de atividade.
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowDietModal(true)}
            >
              Calcular Agora
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Suas Informações</h4>
                <Badge bg="primary" className="p-2">
                  {currentUser.goal}
                </Badge>
              </div>
              
              <Row>
                <Col md={4}>
                  <div className="mb-3">
                    <span className="text-muted d-block">Idade</span>
                    <h5>{currentUser.age} anos</h5>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <span className="text-muted d-block">Peso</span>
                    <h5>{currentUser.weight} kg</h5>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <span className="text-muted d-block">Altura</span>
                    <h5>{currentUser.height} m</h5>
                  </div>
                </Col>
              </Row>
              
              <div className="text-muted">
                Nível de atividade: <strong>{diet.activity_level}</strong>
                <span className="ms-3">
                  Última atualização: <strong>{new Date(diet.last_updated).toLocaleDateString('pt-BR')}</strong>
                </span>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FaChartPie className="me-2" />
                Resumo da Dieta
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                      <h4>Necessidade Calórica Diária</h4>
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{formatNutrient(diet.calories)} kcal</h2>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => setShowDietModal(true)}
                        >
                          Recalcular
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  {/* Detalhes dos Macronutrientes em Calorias */}
                  {renderMacroCalories()}
                </Col>
                <Col md={4}>
                  {/* Usando o componente otimizado para o gráfico */}
                  <MacroNutrientChart />
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="overview" title="Visão Geral">
              {/* Restrições Alimentares */}
              {renderRestrictions()}
            </Tab>
            <Tab eventKey="suggestions" title="Sugestões de Alimentos">
              {/* Sugestões de Alimentos */}
              {renderFoodSuggestions()}
            </Tab>
            <Tab eventKey="meals" title="Plano de Refeições">
              {/* Plano de Refeições */}
              {renderMealSuggestions()}
            </Tab>
          </Tabs>
        </>
      )}
      
      {/* Modal para Calcular Dieta */}
      <Modal show={showDietModal} onHide={() => setShowDietModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Calcular Dieta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nível de Atividade Física</Form.Label>
              <Form.Select 
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="Sedentário">Sedentário (pouco ou nenhum exercício)</option>
                <option value="Levemente ativo">Levemente ativo (exercício leve 1-3 dias/semana)</option>
                <option value="Moderadamente ativo">Moderadamente ativo (exercício moderado 3-5 dias/semana)</option>
                <option value="Muito ativo">Muito ativo (exercício intenso 6-7 dias/semana)</option>
                <option value="Extremamente ativo">Extremamente ativo (exercício muito intenso, trabalho físico)</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Gênero</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Masculino"
                  name="gender"
                  id="gender-male"
                  value="Masculino"
                  checked={gender === 'Masculino'}
                  onChange={e => setGender(e.target.value)}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Feminino"
                  name="gender"
                  id="gender-female"
                  value="Feminino"
                  checked={gender === 'Feminino'}
                  onChange={e => setGender(e.target.value)}
                />
              </div>
            </Form.Group>
            
            <Alert variant="info">
              <div className="d-flex align-items-start">
                <FaInfoCircle className="me-2 mt-1" />
                <div>
                  <p className="mb-1">O cálculo será baseado em:</p>
                  <ul className="mb-0">
                    <li>Seu peso atual: <strong>{currentUser.weight} kg</strong></li>
                    <li>Sua altura: <strong>{currentUser.height} m</strong></li>
                    <li>Sua idade: <strong>{currentUser.age} anos</strong></li>
                    <li>Seu objetivo: <strong>{currentUser.goal}</strong></li>
                  </ul>
                </div>
              </div>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDietModal(false)} disabled={calculating}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCalculateDiet}
            disabled={calculating}
          >
            {calculating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Calculando...
              </>
            ) : (
              'Calcular'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para Adicionar Restrição */}
      <Modal show={showRestrictionModal} onHide={() => setShowRestrictionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Restrição Alimentar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Restrição</Form.Label>
              <Form.Select 
                value={restrictionType}
                onChange={(e) => setRestrictionType(e.target.value)}
              >
                <option value="Alergia">Alergia</option>
                <option value="Intolerância">Intolerância</option>
                <option value="Preferência">Preferência (não gosta)</option>
                <option value="Dieta">Dieta (ex: vegetariano, vegano)</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Amendoim, Lactose, Carne vermelha..."
                value={restrictionDescription}
                onChange={(e) => setRestrictionDescription(e.target.value)}
              />
              <Form.Text className="text-muted">
                Informe o alimento ou ingrediente que deseja restringir.
              </Form.Text>
            </Form.Group>
          </Form>
          
          {restrictions.length > 0 && (
            <div className="mt-4">
              <h6>Restrições Atuais:</h6>
              <ListGroup variant="flush">
                {restrictions.map((restriction, index) => (
                  <ListGroup.Item key={index} className="px-0 py-2">
                    <Badge bg={
                      restriction.restriction_type === 'Alergia' ? 'danger' :
                      restriction.restriction_type === 'Intolerância' ? 'warning' :
                      restriction.restriction_type === 'Preferência' ? 'info' : 'secondary'
                    } className="me-2">
                      {restriction.restriction_type}
                    </Badge>
                    {restriction.description}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestrictionModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddRestriction}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Diet;