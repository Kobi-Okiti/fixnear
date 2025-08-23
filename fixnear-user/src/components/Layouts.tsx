import { Link, Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div>
      <header className="bg-gray-100 p-4 shadow">
        <nav className="flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>

      <footer className="bg-gray-100 p-4 text-center mt-8">
        © 2025 FixNear
      </footer>
    </div>
  )
}
