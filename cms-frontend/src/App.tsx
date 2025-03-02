import Dashboard from './components/Dashboard';
import CattleList from './components/CattleList';
import Nav from './components/Nav';
import TopNav from './components/TopNav';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ContextWrapper from './context/ContextWrapper';
import AddCattleForm from './components/AddCattleForm';

function App() {
  return (
    <BrowserRouter>
      <ContextWrapper>
        <div className="flex w-full h-screen">
          <Nav />
          <div className="flex flex-col w-5/6 bg-gray-100">
            <TopNav />
            <div className="h-9/10 relative">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/livestock" element={<CattleList />} />
                <Route path="/add-cattle" element={<AddCattleForm />} />
              </Routes>
            </div>
          </div>
        </div>
      </ContextWrapper>
    </BrowserRouter>
  );
}

export default App;
