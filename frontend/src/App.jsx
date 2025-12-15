import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { fetchProfile } from './redux/slices/studentSlice'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import RoommateRequests from './pages/RoommateRequests'
import AllottedRoom from './pages/AllottedRoom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PrivateRoute from './routes/PrivateRoute'
import HostelList from './pages/HostelList'
import Request from './pages/Request'
import HostelAllocation from './pages/HostelAllocation'

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { student, loading } = useSelector((state) => state.student);

  // Global Hydration: Fetch profile if token exists but student data is missing
  useEffect(() => {
    const token = localStorage.getItem('token');
    const rollNo = localStorage.getItem('rollNo');

    if (token && rollNo && !student && !loading) {
      dispatch(fetchProfile(rollNo));
    }
  }, [dispatch, student, loading]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/dashboard' element={<PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>}></Route>
        <Route path='/' element={<PrivateRoute><PageTransition><Profile /></PageTransition></PrivateRoute>}></Route>
        <Route path='/requests' element={<PrivateRoute><PageTransition><Request /></PageTransition></PrivateRoute>}></Route>
        <Route path='/allocation' element={<PrivateRoute><PageTransition><HostelAllocation /></PageTransition></PrivateRoute>}></Route>
        <Route path='/hostels' element={<PrivateRoute><PageTransition><HostelList /></PageTransition></PrivateRoute>}></Route>
        <Route path='/login' element={<PageTransition><Login /></PageTransition>}></Route>
      </Routes>
    </AnimatePresence>
  );
}
export default App;