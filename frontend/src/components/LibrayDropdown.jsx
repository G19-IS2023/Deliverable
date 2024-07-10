import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";

const LibraryDropdown = ({ bookId }) => {
  const [libraries, setLibraries] = useState([]);
  const [bookInLibraries, setBookInLibraries] = useState({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      console.error("User ID is not available in localStorage.");
      return;
    }

    // Recupera le librerie dell'utente loggato
    fetch(`http://localhost:5050/book/getLibraries/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch libraries');
        }
        return response.json();
      })
      .then((data) => {
        setLibraries(data);
        return data;
      })
      .then((libraries) => {
        // Reset bookInLibraries to false initially
        const initialBookStatus = libraries.reduce(
          (acc, library) => ({ ...acc, [library.libId]: false }),
          {}
        );
        setBookInLibraries(initialBookStatus);

        return Promise.all(
          libraries.map((library) =>
            fetch(
              `http://localhost:5050/library/${library.libId}/getBook/${bookId}/id/${userId}`
            )
              .then((res) => {
                // Check the content type of the response
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  return res.json();
                } else {
                  return res.text().then(text => {
                    throw new Error(text);
                  });
                }
              })
              .then((resData) => {
                if (
                  Array.isArray(resData) &&
                  resData.some((book) => book.bookId === bookId)
                ) {
                  setBookInLibraries((prevState) => ({
                    ...prevState,
                    [library.libId]: true,
                  }));
                }
              })
              .catch((error) => {
                console.error(
                  `Error checking book in library ${library.libId}:`,
                  error.message
                );
              })
          )
        );
      })
      .catch((error) => {
        console.error("There was an error fetching the libraries!", error);
      });
  }, [bookId, userId]);

  const handleLibraryClick = (libraryId) => {
    const isBookInLibrary = bookInLibraries[libraryId];
    const url = isBookInLibrary
      ? `http://localhost:5050/book/library/${libraryId}/deleteBook/${bookId}/id/${userId}`
      : `http://localhost:5050/book/addBook`;
    const method = isBookInLibrary ? "DELETE" : "POST";
    const data = !isBookInLibrary
      ? { bookId: bookId, libId: libraryId, userId: userId }
      : null;

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`Network response was not ok: ${response.statusText}`);
          throw new Error("Network response was not ok");
        }
        // Controlla se la risposta è JSON o testo semplice
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then((data) => {
        if (typeof data === "string") {
          console.log(data); // Log the success message
        }
        setBookInLibraries((prevState) => ({
          ...prevState,
          [libraryId]: !isBookInLibrary,
        }));
      })
      .catch((error) => {
        console.error("There was an error updating the library!", error);
      });
  };

  return (
    <DropdownButton id="dropdown-basic-button" title="Librerie">
      {libraries.map((library) => (
        <Dropdown.Item
          key={library.libId}
          onClick={() => handleLibraryClick(library.libId)}
          style={{
            backgroundColor: bookInLibraries[library.libId]
              ? "lightgreen"
              : "white",
          }}
        >
          {library.libName}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

LibraryDropdown.propTypes = {
  bookId: PropTypes.string.isRequired,
};

export default LibraryDropdown;

