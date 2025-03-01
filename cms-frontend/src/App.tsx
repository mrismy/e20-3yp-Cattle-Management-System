import Dashboard from './components/Dashboard';
import CattleList from './components/CattleList';
import Nav from './components/Nav';
import TopNav from './components/TopNav';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="flex w-full h-screen">
        <Nav />
        <div className="flex flex-col w-5/6 bg-gray-100">
          <TopNav />
          <div className="h-9/10 relative">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/livestock" element={<CattleList />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
