import './App.css'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import RoommateRequests from './pages/RoommateRequests'
import AllottedRoom from './pages/AllottedRoom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PrivateRoute from './routes/PrivateRoute'
import HostelList from './pages/HostelList'
import Request from './pages/Request'

function App() {
  return (
    <Routes>
      <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>}></Route>
      <Route path='/' element={<PrivateRoute><Profile /></PrivateRoute>}></Route>
      <Route path='/requests' element={<PrivateRoute><Request /></PrivateRoute>}></Route>
      <Route path='/request' element={<PrivateRoute><RoommateRequests /></PrivateRoute>}></Route>
      <Route path='/allotted' element={<PrivateRoute><AllottedRoom /></PrivateRoute>}></Route>
      <Route path='/hostels' element={<PrivateRoute><HostelList /></PrivateRoute>}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/signup' element={<SignUp />}></Route>
    </Routes>
  );
}
export default App