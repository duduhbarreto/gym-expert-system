import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaChartLine, FaClipboardList, FaUserAlt } from 'react-icons/fa';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white text-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <h1 className="display-4 fw-bold mb-4">Sistema Especialista de Academia</h1>
              <p className="lead mb-4">
                Transforme seus treinos com nossa plataforma inteligente que personaliza os exercícios para seus objetivos e nível de experiência.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button as={Link} to="/register" variant="light" size="lg">
                  Começar Agora
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Login
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Como Funciona</h2>
          <Row>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center border-0">
                <Card.Body>
                  <div className="icon-circle bg-primary text-white mb-3">
                    <FaUserAlt size={24} />
                  </div>
                  <Card.Title>Perfil Personalizado</Card.Title>
                  <Card.Text>
                    Crie seu perfil com objetivo, nível de experiência, peso, altura e histórico para treinos precisos.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center border-0">
                <Card.Body>
                  <div className="icon-circle bg-success text-white mb-3">
                    <FaDumbbell size={24} />
                  </div>
                  <Card.Title>Recomendação Inteligente</Card.Title>
                  <Card.Text>
                    Receba treinos personalizados baseados no seu perfil e objetivos específicos.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center border-0">
                <Card.Body>
                  <div className="icon-circle bg-info text-white mb-3">
                    <FaClipboardList size={24} />
                  </div>
                  <Card.Title>Registro de Treinos</Card.Title>
                  <Card.Text>
                    Mantenha um histórico de treinos realizados e acompanhe seu progresso ao longo do tempo.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card className="h-100 shadow-sm text-center border-0">
                <Card.Body>
                  <div className="icon-circle bg-warning text-white mb-3">
                    <FaChartLine size={24} />
                  </div>
                  <Card.Title>Análise de Desempenho</Card.Title>
                  <Card.Text>
                    Visualize estatísticas e métricas para entender seu progresso e melhorar seus resultados.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <img 
                src="/api/placeholder/600/400" 
                alt="Pessoas treinando na academia" 
                className="img-fluid rounded shadow"
              />
            </Col>
            <Col lg={6}>
              <h2 className="mb-4">Por que usar o Sistema Especialista de Academia?</h2>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center">
                  <span className="badge rounded-pill bg-primary me-2">1</span>
                  <strong>Economia de tempo:</strong> Não perca tempo procurando treinos na internet, receba recomendações personalizadas.
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <span className="badge rounded-pill bg-primary me-2">2</span>
                  <strong>Resultados melhores:</strong> Treinos adaptados ao seu perfil geram resultados mais eficientes.
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <span className="badge rounded-pill bg-primary me-2">3</span>
                  <strong>Acompanhamento completo:</strong> Visualize seu progresso e adapte seus treinos conforme evolui.
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <span className="badge rounded-pill bg-primary me-2">4</span>
                  <strong>Base científica:</strong> Treinos elaborados com base em princípios de treinamento e fisiologia do exercício.
                </li>
              </ul>
              <Button as={Link} to="/register" variant="primary" className="mt-3">
                Experimente Agora
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">O que nossos usuários dizem</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-circle bg-primary text-white me-3" style={{width: '50px', height: '50px', fontSize: '20px'}}>
                      M
                    </div>
                    <div>
                      <h5 className="mb-0">Marcos Silva</h5>
                      <p className="text-muted mb-0">Usuário há 6 meses</p>
                    </div>
                  </div>
                  <Card.Text>
                    "Nunca consegui manter uma rotina de exercícios consistente até começar a usar este sistema. Os treinos são desafiadores, mas adequados ao meu nível."
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-circle bg-info text-white me-3" style={{width: '50px', height: '50px', fontSize: '20px'}}>
                      C
                    </div>
                    <div>
                      <h5 className="mb-0">Carla Oliveira</h5>
                      <p className="text-muted mb-0">Usuário há 3 meses</p>
                    </div>
                  </div>
                  <Card.Text>
                    "Perdi 8kg desde que comecei a seguir os treinos recomendados! Adoro como o sistema se adapta conforme meu progresso e feedback."
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-circle bg-success text-white me-3" style={{width: '50px', height: '50px', fontSize: '20px'}}>
                      R
                    </div>
                    <div>
                      <h5 className="mb-0">Rafael Costa</h5>
                      <p className="text-muted mb-0">Usuário há 8 meses</p>
                    </div>
                  </div>
                  <Card.Text>
                    "Como instrutor, recomendo a todos os meus alunos. Os treinos são bem estruturados e baseados em princípios científicos sólidos."
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white text-center">
        <Container>
          <h2 className="mb-4">Pronto para transformar seus treinos?</h2>
          <p className="lead mb-4">
            Junte-se aos milhares de usuários que já estão alcançando seus objetivos com o Sistema Especialista de Academia.
          </p>
          <Button as={Link} to="/register" variant="light" size="lg">
            Comece Gratuitamente
          </Button>
        </Container>
      </section>
    </>
  );
};

export default Home;