import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import google from '../../assets/google.png';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('Logged in:', userCredential.user)
      navigate('/home')
    } catch (authError) {
      console.error(authError)
      setError('Unable to sign in with email and password.')
    } finally {
      setLoading(false)
    }
  }
async function handleGoogleAuth() {
  setGoogleLoading(true);
  setError(null);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Logged in with Google Popup:', result.user);
    navigate('/home');
  } catch (error) {
    console.error(error);
    setError('Unable to sign in with Google');
  } finally {
    setGoogleLoading(false);
  }
}

  return (
    <>
    <h1 className="text-2xl font-semibold mb-4 text-center">Sign in to Stride</h1>
        <div className="w-full mx-auto p-8 rounded-lg border border-purple-400">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:border-purple-500 outline-none"
            placeholder="Your email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:border-purple-500 outline-none"
            placeholder="Your password"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-md bg-purple-600 text-white py-2 font-semibold disabled:opacity-50 hover:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
            <div className="relative flex-row gap-1 my-6">
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card font-bold text-foreground/50">Or</span>
              </div>
            </div>
      <div className="mt-4">
        <button
          type="button"
          className="w-full rounded-md border bg-white text-black py-2 font-semibold hover:bg-transparent hover:text-[#E0E0E0] flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleGoogleAuth}
          disabled={googleLoading}
        >
          <img src={google} alt="Google logo" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
    </>

  )
}

export default LoginForm
