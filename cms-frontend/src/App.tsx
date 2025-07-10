import Dashboard from "./components/Dashboard";
import CattleList from "./components/Livestock/CattleList";
import Nav from "./components/Nav";
import TopNav from "./components/TopNav";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import ContextWrapper from "./context/ContextWrapper";
import Login from "./components/Login";
import Signup from "./components/Signup";
import RequireAuth from "./components/RequireAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MapPage from "./components/Map/MapPage";
import GeoFencePage from "./components/GeoFence/GeoFencePage";
import Profile from "./components/Profile";
import AddCattleForm from "./components/Livestock/AddCattleForm";
import Settings from "./components/Settings/Settings";
import EditCattleForm from "./components/Livestock/EditCattleForm";
import CattleCard from "./components/Livestock/CattleCard";
import DeleteConformation from "./components/Livestock/DeleteConformation";
import { NotificationProvider } from "./context/NotificationContext";
import AlertScreen from "./components/AlertScreen";

function App() {
  return (
    <>
      <BrowserRouter>
        <ContextWrapper>
          <NotificationProvider>
            <div className="flex w-full h-screen">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                  element={
                    <>
                      <Nav />
                      <div className="flex flex-col w-6/7 bg-gray-100">
                        <TopNav />
                        <div className="h-11/12 relative">
                          <Outlet />
                        </div>
                      </div>
                    </>
                  }
                >
                  <Route element={<RequireAuth />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/livestock" element={<CattleList />}>
                      <Route path="add-cattle" element={<AddCattleForm />} />
                      <Route
                        path="edit-cattle/:cattleId"
                        element={<EditCattleForm />}
                      />
                      <Route path=":cattleId" element={<CattleCard />} />
                      <Route
                        path="delete-cattle/:cattleId"
                        element={<DeleteConformation />}
                      />
                    </Route>
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/geo-fence" element={<GeoFencePage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/alerts" element={<AlertScreen />} />
                    <Route path="/alerts/:id" element={<AlertScreen />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </NotificationProvider>
        </ContextWrapper>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
}

export default App;
