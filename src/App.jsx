/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */

import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Dashboard from '~/pages/Dashboard';
import Login from '~/pages/Login';

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (!user) {
    return <Navigate to='/login' replace={true} />;
  }
  return <Outlet />;
};

const UnAuthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user) {
    return <Navigate to='/dashboard' replace={true} />;
  }
  return <Outlet />;
};

console.log(JSON.parse(localStorage.getItem('userInfo')));

function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace={true} />} />

      <Route element={<UnAuthorizedRoutes />}>
        <Route path='/login' element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
