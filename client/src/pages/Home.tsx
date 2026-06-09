
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log('User signed out')
      navigate('/auth')

    } catch (err) {
      console.error('Sign out error', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-lg border border-purple-400 bg-slate-900 text-slate-100">
        <h1 className="text-2xl font-semibold mb-4 text-center">Home</h1>
        <p className="mb-6 text-center text-slate-300">Welcome to Stride.</p>
        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-purple-600 text-white py-2 font-semibold hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Home