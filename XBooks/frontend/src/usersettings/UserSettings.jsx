import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import "./usersettings.css";

function UserSettings() {
  const [show, setShow] = useState(false);
  const [field, setField] = useState("");
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = (fieldName) => {
    setField(fieldName);
    setShow(true);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5050/user/modifyUsername",
        {
          userId,
          newUsername: username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShow(false);
    } catch (error) {
      console.error("Failed to update username:", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5050/user/modifyPassword",
        {
          userId,
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShow(false);
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => handleShow("username")}>
        Modifica Username
      </Button>
      <Button variant="primary" onClick={() => handleShow("password")}>
        Modifica Password
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modifica {field}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={
              field === "username" ? handleUsernameSubmit : handlePasswordSubmit
            }
          >
            {field === "username" ? (
              <Form.Group>
                <Form.Label>Nuovo Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>
            ) : (
              <>
                <Form.Group>
                  <Form.Label>Vecchia Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Nuova Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>
              </>
            )}
            <Button variant="primary" type="submit">
              Salva
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UserSettings;
