import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import ActivityCreate from './pages/ActivityCreate'
import SignupManage from './pages/SignupManage'
import ReviewNotify from './pages/ReviewNotify'
import ActivityData from './pages/ActivityData'
import CommentsManage from './pages/CommentsManage'
import SettingsManage from './pages/SettingsManage'
import BadgeRules from './pages/BadgeRules'
import Notifications from './pages/Notifications'
import Scheduler from './pages/Scheduler'
import NotFound from './pages/NotFound'
import { getToken } from './services/auth'
import FormDesigner from './pages/FormDesigner'

function RequireAuth() {
  const location = useLocation()
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}> 
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activity-create" element={<ActivityCreate />} />
            <Route path="/signups" element={<SignupManage />} />
            <Route path="/form-designer" element={<FormDesigner />} />
            <Route path="/reviews" element={<ReviewNotify />} />
            <Route path="/activity-data" element={<ActivityData />} />
            <Route path="/comments" element={<CommentsManage />} />
            <Route path="/settings" element={<SettingsManage />} />
            <Route path="/badge-rules" element={<BadgeRules />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
