import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import BookCarousel from "../components/BookCarosel";

const LibraryList = () => {
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    // Recupera tutte le librerie per l'utente loggato
    axios
      .get(`/book/getLibraries/${userId}`, userId)
      .then((response) => {
        const libs = response.data;
        // Per ogni libreria, recupera i libri
        libs.forEach((library) => {
          // Recupera i dettagli di ciascun libro utilizzando un'altra API
          const bookDetailsPromises = library.books.map((book) => {
            return axios
              .get(`https://example-data.draftbit.com/books?id=${book.bookId}`)
              .then((bookDetailsResponse) => {
                // Aggiungi 'pagesRead' ai dettagli del libro
                return {
                  ...bookDetailsResponse.data,
                  pagesRead: book.pagesRead,
                };
              })
              .catch((err) => {
                console.error(
                  `Error fetching book details for ${book.bookId}`,
                  err
                );
                return null; // Ritorna null se il fetch fallisce
              });
          });

          Promise.all(bookDetailsPromises).then((completedBooks) => {
            // Aggiorna le librerie con i libri completi di dettagli
            setLibraries((prevLibraries) =>
              prevLibraries.map((lib) =>
                lib.libId === library.libId
                  ? {
                      ...lib,
                      books: completedBooks.filter((book) => book != null),
                    }
                  : lib
              )
            );
          });
        });
      })
      .catch((error) => {
        console.error("There was an error fetching the libraries!", error);
      });
  }, []);

  return (
    <div>
      {libraries.map((library) => (
        <Card key={library.libId} className="mb-3">
          <Card.Body>
            <Card.Title>{library.name}</Card.Title>
            {/* Passa i libri della libreria corrente al BookCarousel */}
            <BookCarousel items={library.books || []} category={library.name} />
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default LibraryList;
