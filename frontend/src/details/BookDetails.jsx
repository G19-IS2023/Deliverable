import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../App";
import { BOOK_DETAILS_URL } from "../API";
import ProgressBar from "../components/ProgressBar";
import "./book_details.css";
import LibraryDropdown from "../components/LibrayDropdown";

function BookDetails() {
  const [book, setBook] = useState({});
  const { id } = useParams(); // Assuming this is the book ID
  const [progress, setProgress] = useState(0);
  const [readPages, setReadPages] = useState(0);
  const userId = localStorage.getItem("userId"); // Fetch the user ID from localStorage
  const incrementInterval = useRef(null);
  const decrementInterval = useRef(null);
  const prevReadPages = useRef(0); // Reference to track changes in readPages for API update

  // Function to fetch and update read pages from the API
  const fetchAndUpdatePagesRead = async () => {
    try {
      const { data: libraries } = await axios.get(`http://localhost:5050/book/getLibraries/${userId}`);
      let foundBook = false;

      // Check each library to see if it contains the book
      for (let library of libraries) {
        try {
          const res = await axios.get(`http://localhost:5050/book/library/${library.libId}/getBook/${id}/id/${userId}`);
          if (res.status === 200 && res.data.pagesRead !== undefined) {
            setReadPages(res.data.pagesRead);
            foundBook = true;
            break;
          }
        } catch (error) {
          console.error("Error fetching book details in library", error);
        }
      }

      // If no book is found in any library, add it to the default library
      if (!foundBook) {
        await axios.post('http://localhost:5050/book/addBook', { bookId: id, libId: "1", userId: userId });
        setReadPages(0); // Assuming starting from 0 pages read if book not found
      }
    } catch (error) {
      console.error("Failed to fetch libraries or book details", error);
    }
  };

  // Function to update the read pages in all libraries where the book exists
  const updateReadPagesInLibraries = async () => {
    const { data: libraries } = await axios.get(`http://localhost:5050/book/getLibraries/${userId}`);
    libraries.forEach(async (library) => {
      try {
        await axios.put('http://localhost:5050/book/modifyPages', {
          bookId: id,
          libId: library.libId,
          pages: readPages,
          userId: userId
        });
      } catch (error) {
        console.error("Error updating pages in library", error);
      }
    });
  };

  // Handlers for increment and decrement of pages
  const handleIncrement = () => {
    if (readPages < book.num_pages) {
      setReadPages(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (readPages > 0) {
      setReadPages(prev => prev - 1);
    }
  };

  const startIncrement = () => {
    handleIncrement();
    incrementInterval.current = setInterval(handleIncrement, 100);
  };

  const stopIncrement = () => {
    clearInterval(incrementInterval.current);
    if (prevReadPages.current !== readPages) {
      prevReadPages.current = readPages;
      updateReadPagesInLibraries();
    }
  };

  const startDecrement = () => {
    handleDecrement();
    decrementInterval.current = setInterval(handleDecrement, 100);
  };

  const stopDecrement = () => {
    clearInterval(decrementInterval.current);
    if (prevReadPages.current !== readPages) {
      prevReadPages.current = readPages;
      updateReadPagesInLibraries();
    }
  };

  useEffect(() => {
    fetchAndUpdatePagesRead(); // Fetch and set initial pages read when the component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (book.num_pages) {
      setProgress((readPages / book.num_pages) * 100);
    }
  }, [readPages, book.num_pages]);

  useEffect(() => {
    axios.get(`${BOOK_DETAILS_URL}/${id}`)
      .then((res) => {
        setBook(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  return (
    <>
      <div className="book-details-2">
        <div className="bd_title_container">
          <h2 className="bd_title">{book?.title}</h2>
        </div>
        <div className="book-details">
          <div className="book-image">
            <img src={book?.image_url} alt="Book cover" />
          </div>
          <div className="book-description">
            <div className="book-description-2">
              <h3>Description:</h3>
              <p>{book?.description}</p>
              <h3>Authors</h3>
              <p>{book?.authors}</p>
              <h3>Genres</h3>
              <p>{book?.genres}</p>
              <LibraryDropdown bookId={id} />
            </div>
          </div>
        </div>
      </div>
      <div className="progress_bar_container">
        <div className="add-pages">
          <img
            src="/src/assets/remove.png"
            className="icon-pages"
            onMouseDown={startDecrement}
            onMouseUp={stopDecrement}
            onMouseLeave={stopDecrement}
            alt="Decrease pages"
          />
          <input
            type="number"
            value={readPages}
            onChange={(e) => setReadPages(parseInt(e.target.value) || 0)}
            className="input-pages"
          />
          <img
            src="/src/assets/add.png"
            className="icon-pages"
            onMouseDown={startIncrement}
            onMouseUp={stopIncrement}
            onMouseLeave={stopIncrement}
            alt="Increase pages"
          />
        </div>
        <p>of {book.num_pages} pages</p>
        <ProgressBar className="progress-bar" progress={progress} />
      </div>
    </>
  );
}

export default BookDetails;
