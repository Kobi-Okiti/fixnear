import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Profile from "./pages/Profile"
import ArtisanProfile from "./pages/ArtisanProfile"
import NotFound from "./pages/NotFound"
import Layout from "./components/Layouts"

export default function App() {
  return (
     <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        <Route path="artisan/:id" element={<ArtisanProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
