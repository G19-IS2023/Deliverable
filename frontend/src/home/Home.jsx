import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Container } from "react-bootstrap";
import BookCarousel from "../components/BookCarosel"; // Correzione del nome del file importato
import axios from 'axios'
import { API_URL } from "../API";
import "bootstrap/dist/css/bootstrap.min.css";
import './home.css';

function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="sfondo_home">
      <div className="book_of_the_day_container">
        <h1 className="titolo_bod">Book of the day!</h1>
        <div className="book_of_the_day_container_2">
          <img src="/src/assets/book_cover_test.jpg" className="copertina" alt="Book Cover"/>
          <div className="book_of_the_day_container_3">
            <h2>Titolooo</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>
      <Container fluid>
        <Row>
          <Col sm={2} />
          <Col sm={8} className="aggiunti_recente_box">
            {books.length > 0 ? <BookCarousel items={books} sortmethod={1} category="Fan favorites"/> : null}
          </Col>
          <Col sm={2} />
        </Row>
        <Row>
          <Col sm={2} />
          <Col sm={8} className="aggiunti_recente_box">
            {books.length > 0 ? <BookCarousel items={books} sortmethod={2} category="Longest"/> : null}
          </Col>
          <Col sm={2} />
        </Row>
        <Row>
          <Col sm={2} />
          <Col sm={8} className="aggiunti_recente_box">
            {books.length > 0 ? <BookCarousel items={books} sortmethod={3} genre="Mystery" category="Mystery"/> : null}
          </Col>
          <Col sm={2} />
        </Row>
      </Container>
    </div>
  );
}

export default Home;
