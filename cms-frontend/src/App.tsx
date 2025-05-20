import Dashboard from './components/Dashboard';
import CattleList from './components/CattleList';
import Nav from './components/Nav';
import TopNav from './components/TopNav';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import ContextWrapper from './context/ContextWrapper';
import AddCattleForm from './components/AddCattleForm';
import MapMenu from './components/MapPage';
import Login from './components/Login';
import Signup from './components/Signup';
import RequireAuth from './components/RequireAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <ContextWrapper>
          <div className="flex w-full h-screen">
            {/* Conditional rendering for Nav/TopNav */}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Layout for authenticated routes */}

              <Route
                element={
                  <>
                    <Nav />
                    <div className="flex flex-col w-5/6 bg-gray-100">
                      <TopNav />
                      <div className="h-9/10 relative">
                        <Outlet />
                      </div>
                    </div>
                  </>
                }>
                <Route element={<RequireAuth />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/livestock" element={<CattleList />} />
                  <Route path="/map" element={<MapMenu />} />
                  <Route path="/add-cattle" element={<AddCattleForm />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </ContextWrapper>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
