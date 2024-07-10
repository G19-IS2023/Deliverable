import { useEffect, useState } from "react";
import BookCarousel from "../components/BookCarosel";
import "./librarylist.css";

const LibraryList = () => {
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    // Recupera tutte le librerie per l'utente loggato
    fetch(`http://localhost:5050/book/getLibraries/${userId}`)
      .then((response) => response.json()) // Convertire la risposta in JSON
      .then((data) => {
        const libs = data;

        libs.forEach((library) => {
          if (library.books.length === 0) {
            // Gestisce le librerie senza libri
            setLibraries((prevLibraries) => {
              const exists = prevLibraries.some(
                (lib) => lib.libId === library.libId
              );
              if (!exists) {
                return [
                  ...prevLibraries,
                  { libId: library.libId, libName: library.libName, books: [] },
                ];
              }
              return prevLibraries;
            });
          } else {
            const bookDetailsPromises = library.books.map(async (book) => {
              return fetch(
                `https://example-data.draftbit.com/books?id=${book.bookId}`
              )
                .then((response) => response.json())
                .then((bookDetails) => {
                  // Aggiungi pagesRead direttamente dentro l'oggetto bookDetails
                  return {
                    ...bookDetails[0],
                    pagesRead: book.pagesRead,
                  };
                })
                .catch((err) => {
                  console.error(
                    `Error fetching book details for ${book.bookId}`,
                    err
                  );
                  return null; // Return null if the fetch fails
                });
            });

            Promise.all(bookDetailsPromises).then((completedBooks) => {
              setLibraries((prevLibraries) => {
                const updatedLibraries = prevLibraries.map((lib) =>
                  lib.libId === library.libId
                    ? {
                        ...lib,
                        books: completedBooks.filter((book) => book != null),
                      }
                    : lib
                );
                const exists = updatedLibraries.some(
                  (lib) => lib.libId === library.libId
                );
                if (!exists) {
                  updatedLibraries.push({
                    libId: library.libId,
                    libName: library.libName,
                    books: completedBooks.filter((book) => book != null),
                  });
                }
                return updatedLibraries;
              });
            });
          }
        });
      })
      .catch((error) => {
        console.error("There was an error fetching the libraries!", error);
      });
  }, []);

  return (
    <div className="libraryListBody">
      {libraries.length === 0
        ? console.log("aspetto i libri") // This is displayed if libraries array is empty
        : libraries.map((library) => {
            console.log(
              `Rendering BookCarousel for library: ${library.libName}`,
              library.books
            );
            return (
              <BookCarousel
                key={library.libId}
                items={library.books || []}
                category={library.libName}
              />
            );
          })}
    </div>
  );
};

export default LibraryList;
