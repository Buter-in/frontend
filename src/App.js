import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from './components/Header/Header';
import { Web3 } from './wrappers/web3';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PathSearch } from './pages/PathSearch';
import { PathResult } from './pages/PathResult';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  return (
    <Router>
      <div className="App">
        {/* {Web3(Header, {})} */}
        <Web3>
          <Header />
          <Routes>
            <Route path="/" element={<PathSearch />} />
            <Route path="/:from/:to" element={<PathResult />} />
          </Routes>
          <ToastContainer hideProgressBar={true}/>
        </Web3>
      </div>
    </Router>
  );
}

export default App;
