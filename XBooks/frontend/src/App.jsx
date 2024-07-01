/* eslint-disable no-unused-vars */

import { Routes, Route } from "react-router-dom";
import Home from "./home/Home";
import LogIn from "./login/LogIn";
import Register from "./register/Register";
import BookDetails from "./details/BookDetails";
import FullPage from "./fullpage/FullPage";
function App() {
  //const [selectedLink, setSelectedLink] = useState("");
//setSelectedLink={setSelectedLink}
  return (
    <>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path='/books/:id' element={<BookDetails/>}/>
        <Route path='/books/full/:id' element={<FullPage/>}/>
      </Routes>
    </>
  );
}

export default App;
