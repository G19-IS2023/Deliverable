import { useEffect, useState } from "react";
import BookCarousel from "../components/BookCarosel";
import './librarylist.css';

const LibraryList = () => {
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    // Recupera tutte le librerie per l'utente loggato
    fetch(`http://localhost:5050/book/getLibraries/${userId}`)
      .then(response => response.json())  // Converting the response to JSON
      .then(data => {
        const libs = data;

        libs.forEach((library) => {
          if (library.books.length === 0) {
            // Gestisce le librerie senza libri
            setLibraries((prevLibraries) => {
              const exists = prevLibraries.some(lib => lib[0] === library.libId);
              if (!exists) {
                return [...prevLibraries, [library.libId, library.libName, []]];
              }
              return prevLibraries;
            });
          } else {
            const bookDetailsPromises = library.books.map(async (book) => {
              return await fetch(`https://example-data.draftbit.com/books?id=${book.bookId}`)
                .then(response => response.json())
                .then(bookDetails => {
                  return {
                    ...bookDetails,
                    pagesRead: book.pagesRead,
                  };
                })
                .catch(err => {
                  console.error(`Error fetching book details for ${book.bookId}`, err);
                  return null; // Return null if the fetch fails
                });
            });

            Promise.all(bookDetailsPromises).then((completedBooks) => {
              setLibraries((prevLibraries) => {
                const updatedLibraries = prevLibraries.map((lib) =>
                  lib[0] === library.libId
                    ? [
                        lib[0],
                        lib[1],
                        completedBooks.filter((book) => book != null),
                      ]
                    : lib
                );
                const exists = updatedLibraries.some(lib => lib[0] === library.libId);
                if (!exists) {
                  updatedLibraries.push([
                    library.libId,
                    library.libName,
                    completedBooks.filter((book) => book != null),
                  ]);
                }
                return updatedLibraries;
              });
            });
          }
        });
      })
      .catch(error => {
        console.error("There was an error fetching the libraries!", error);
      });

  }, []);

  return (
    <div className="libraryListBody">
      {libraries.map(([libId, libName, books]) => (
        <BookCarousel key={libId} items={books || []} category={libName} />
      ))}
    </div>
  );
};

export default LibraryList;
