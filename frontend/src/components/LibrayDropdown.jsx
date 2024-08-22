// src/components/LibraryDropdown.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const LibraryDropdown = ({ bookId, userId }) => {
  const [libraries, setLibraries] = useState([]);
  const [bookInLibraries, setBookInLibraries] = useState({});

  useEffect(() => {
    // Recupera le librerie dell'utente loggato
    axios.get(`/book/getLibraries/${userId}`)
      .then(response => {
        setLibraries(response.data);
        // Controlla in quali librerie è presente il libro
        response.data.forEach(library => {
          axios.get(`/book/library/${library.name}/getBook/${bookId}/id/${userId}`)
            .then(res => {
              if (res.data.some(book => book.id === bookId)) {
                setBookInLibraries(prevState => ({
                  ...prevState,
                  [library.id]: true
                }));
              }
            });
        });
      })
      .catch(error => {
        console.error('There was an error fetching the libraries!', error);
      });
  }, [bookId, userId]);

  const handleLibraryClick = (libraryId) => {
    const isBookInLibrary = bookInLibraries[libraryId];
    const url = isBookInLibrary ? `/api/library/${libraryId}/books/${bookId}` : `/api/library/${libraryId}/books`;
    const method = isBookInLibrary ? 'delete' : 'post';
    const data = !isBookInLibrary ? { bookId: bookId , pagesRead: 0 } : null;

    axios({ method, url, data })
      .then(() => {
        setBookInLibraries(prevState => ({
          ...prevState,
          [libraryId]: !isBookInLibrary
        }));
      })
      .catch(error => {
        console.error('There was an error updating the library!', error);
      });
  };

  return (
    <DropdownButton id="dropdown-basic-button" title="Librerie">
      {libraries.map(library => (
        <Dropdown.Item
          key={library.id}
          onClick={() => handleLibraryClick(library.id)}
          style={{ backgroundColor: bookInLibraries[library.id] ? 'lightgreen' : 'white' }}
        >
          {library.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

LibraryDropdown.propTypes = {
    bookId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
  };

export default LibraryDropdown;
