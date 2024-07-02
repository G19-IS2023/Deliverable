/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./nav_and_offcanvas.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./nav_and_offcanvas.css";
import { Col, Row } from "react-bootstrap";

function NavbarAndOffcanvas() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState({
    name: "Guest",
    email: "guest@example.com",
    profilePicture: "/src/assets/guest.png"
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
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
            console.error("User not found, setting default guest values.");
          }
        } catch (error) {
          console.error("Cannot complete the task, setting default guest values.", error);
        }
      } else {
        console.error("No userId found in localStorage, setting default guest values.");
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      <div>
        <Offcanvas show={show} onHide={handleClose} className="offcanvas">
          <Offcanvas.Header closeButton></Offcanvas.Header>
          <Offcanvas.Body>
            <div>
              <div className="ppo_container">
                <img
                  src={user.profilePicture}
                  className="profile_picture_offcanvas"
                  alt="Profile"
                />
                <h4 className="nome">{user.name}</h4>
                <p>{user.email}</p>
              </div>
              <div>
                <Link className="box_opzioni2" to="/">
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
                <Link className="box_opzioni2" to="/">
                  <div className="opzione">
                    <hr className="riga" />
                  </div>
                  <div className="preview">
                    <div className="box_opzioni">
                      <img className="icone" alt="icon" />
                      <h4 className="opzioni">Wish List</h4>
                    </div>
                    <img className="freccia" alt="arrow" />
                  </div>
                </Link>
              </div>
              <div>
                <Link className="box_opzioni2" to="/">
                  <div className="opzione">
                    <hr className="riga" />
                  </div>
                  <div className="preview">
                    <div className="box_opzioni">
                      <img className="icone" alt="icon" />
                      <h4 className="opzioni">Chat</h4>
                    </div>
                    <img className="freccia" alt="arrow" />
                  </div>
                </Link>
              </div>
              <div>
                <Link className="box_opzioni2" to="/">
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