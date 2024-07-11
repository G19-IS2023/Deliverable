import { useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './nav_and_offcanvas.css';

function NavbarAndOffcanvas() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState({
    name: 'Guest',
    email: 'guest@example.com',
  });
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:5050/user/getUser/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setUser({
              name: data.name,
              email: data.email
            });
          } else {
            console.error('User not found, setting default guest values.');
            setUser({
              name: 'Guest',
              email: 'guest@example.com'
            });
          }
        } catch (error) {
          console.error('Cannot complete the task, setting default guest values.', error);
          setUser({
            name: 'Guest',
            email: 'guest@example.com'
          });
        }
      } else {
        console.error('No userId found in localStorage, setting default guest values.');
        setUser({
          name: 'Guest',
          email: 'guest@example.com'
        });
      }
    };

    fetchUserData();

    const handleStorageChange = (event) => {
      if (event.key === 'userId') {
        setUserId(event.newValue);  // Aggiorna userId se cambia nel local storage
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId]);  // Riesegui l'effect quando userId cambia

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  return (
    <div>
      <div>
        <Offcanvas show={show} onHide={handleClose} className="offcanvas">
          <Offcanvas.Header closeButton></Offcanvas.Header>
          <Offcanvas.Body>
            <div>
              <div className="ppo_container">
                <img
                  src='/src/assets/guest.png'
                  className="profile_picture_offcanvas"
                  alt="Profile"
                />
                <h4 className="nome">{user.name}</h4>
                <p>{user.email}</p>
              </div>
              <div>
                <Link className="box_opzioni2" to="/userLibrary">
                  <div className="opzione">
                    <hr className="riga" />
                  </div>
                  <div className="preview">
                    <div className="box_opzioni">
                      <img className="icone" alt="icon" />
                      <h4 className="opzioni">My Library</h4>
                    </div>
                    <img className="freccia" alt="arrow" />
                  </div>
                </Link>
              </div>
              <div>
                <Link className="box_opzioni2" to="/home">
                  <div className="opzione">
                    <hr className="riga" />
                  </div>
                  <div className="preview">
                    <div className="box_opzioni">
                      <img className="icone" alt="icon" />
                      <h4 className="opzioni">Home</h4>
                    </div>
                    <img className="freccia" alt="arrow" />
                  </div>
                </Link>
              </div>
              <div>
                <Link className="box_opzioni2" to="/userSettings" user={user}>
                  <div className="opzione">
                    <hr className="riga" />
                  </div>
                  <div className="preview">
                    <div className="box_opzioni">
                      <img className="icone" alt="icon" />
                      <h4 className="opzioni">User settings</h4>
                    </div>
                    <img className="freccia" alt="arrow" />
                  </div>
                </Link>
              </div>
              <div>
                <Link className="box_opzioni2" to="/" onClick={handleLogout}>
                  <div className="opzione">
                    <hr className="riga" />
                  </div>
                  <div className="preview">
                    <div className="box_opzioni">
                      <img className="icone" alt="icon" />
                      <h4 className="opzioni">Log Out</h4>
                    </div>
                    <img className="freccia" alt="arrow" />
                  </div>
                </Link>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
      <div className="navbar_sticky">
        <Navbar className="navbarbox">
          <Row className="riga">
            <Col md={2} className="left-col">
              <div className="img_container">
                <img
                  src="/src/assets/guest.png"
                  className="menu_icon"
                  onClick={handleShow}
                  alt="Menu"
                />
              </div>
            </Col>
            <Col md={8}>
              <div className="ricerca">
                <input
                  type="text"
                  placeholder="Search"
                  className="search_input"
                ></input>
                <div>
                  <img
                    src="/src/assets/icona_ricerca.png"
                    className="search_icon"
                    alt="Search"
                  />
                </div>
              </div>
            </Col>
            <Col md={2} className="right-col">
              <img
                src="/src/assets/logo_intero.png"
                className="logo_intero"
                alt="Logo"
              />
            </Col>
          </Row>
        </Navbar>
      </div>
    </div>
  );
}

export default NavbarAndOffcanvas;
