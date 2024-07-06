// src/components/LibraryList.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import BookCarousel from './BookCarousel';

const LibraryList = () => {
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    // Recupera le librerie dell'utente loggato
    axios.get('/api/user/libraries')
      .then(response => {
        const libs = response.data;
        setLibraries(libs);
        libs.forEach(library => {
          axios.get(`/api/library/${library.id}/books`)
            .then(res => {
              setLibraries(prevLibraries => 
                prevLibraries.map(lib => 
                  lib.id === library.id ? { ...lib, books: res.data } : lib
                )
              );
            });
        });
      })
      .catch(error => {
        console.error('There was an error fetching the libraries!', error);
      });
  }, []);

  return (
    <div>
      {libraries.map(library => (
        <Card key={library.id} className="mb-3">
          <Card.Body>
            <Card.Title>{library.name}</Card.Title>
            <BookCarousel books={library.books || []} />
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default LibraryList;
