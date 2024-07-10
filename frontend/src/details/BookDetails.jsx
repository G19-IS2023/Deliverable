import { useState, useEffect, useRef } from "react";
import "../App";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BOOK_DETAILS_URL } from "../API";
import ProgressBar from "../components/ProgressBar";
import "./book_details.css";
import LibraryDropdown from "../components/LibrayDropdown";

function BookDetails() {
  const [book, setBook] = useState({});

  const { id } = useParams(); //id dall'url
  const [progress, setProgress] = useState(0);
  const [readPages, setReadPages] = useState(0);
  const incrementInterval = useRef(null);
  const decrementInterval = useRef(null);

  const handleIncrement = () => {
    if (readPages < book.num_pages) setReadPages((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (readPages > 0) setReadPages((prev) => prev - 1);
  };

  const handleChangePages = (e) => {
    if (Number(e.target.value) > book.num_pages) {
      setReadPages(book.num_pages);
      e.target.value = book.num_pages;
    } else {
      setReadPages(Number(e.target.value));
    }
  };

  useEffect(() => {
    if (book.num_pages) {
      setProgress((readPages / book.num_pages) * 100);
    }
  }, [readPages, book.num_pages]);

  useEffect(() => {
    axios
      .get(`${BOOK_DETAILS_URL}/${id}`)
      .then((res) => {
        setBook(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const startIncrement = () => {
    handleIncrement();
    incrementInterval.current = setInterval(handleIncrement, 100);
  };

  const stopIncrement = () => {
    clearInterval(incrementInterval.current);
  };

  const startDecrement = () => {
    handleDecrement();
    decrementInterval.current = setInterval(handleDecrement, 100);
  };

  const stopDecrement = () => {
    clearInterval(decrementInterval.current);
  };

  return (
    <>
      <div className="book-details-2">
      <div className="bd_title_container">
            <h2 className="bd_title">{book?.title}</h2>
        </div>
        <div className="book-details">
        <div className="book-image">
          <img src={book?.image_url} alt="#" />
        </div>
        <div className="book-description">
          
          <div className="book-description-2">
            <h3>Description:</h3>
            <p>{book?.description}</p>
            <h3>Authors</h3>
            <p>{book?.authors}</p>
            <h3>Genres</h3>
            <p>{book?.genres}</p>
            <LibraryDropdown bookId={id}/>
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
          />
          <div className="pages">
            <input
              type="numeric"
              value={readPages}
              onChange={handleChangePages}
              className="input-pages"
            />
            <p className="text-pages"></p>
          </div>
          <img
            src="/src/assets/add.png"
            className="icon-pages"
            onMouseDown={startIncrement}
            onMouseUp={stopIncrement}
            onMouseLeave={stopIncrement}
          />
        </div>
        <p>of {book.num_pages} pages</p>
        <ProgressBar className="progress-bar" progress={progress} />
      </div>
    </>
  );
}

export default BookDetails;
