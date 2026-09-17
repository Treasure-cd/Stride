import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
} from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import google from '../../assets/google.png'
import { FormInput } from '../ui/FormInput'
import { FormButton } from '../ui/FormButton'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const navigate = useNavigate()

  const isFormValid = email.trim() !== '' && password !== ''
  
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
      <div className="w-full max-w-md mx-auto p-4 sm:p-8 rounded-lg border border-(--border-subtle) bg-(--bg-elevated)">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="login-email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
            required
          />
          <FormInput
            id="login-password"
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
          />
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
        <FormButton
          type="submit"
          loading={loading}
          loadingText="Signing in…"
          disabled={!isFormValid}
        >
          Sign in
        </FormButton>
        </form>

        <div className="relative flex-row gap-1 my-6">
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-(--bg-elevated) font-bold text-(--text) opacity-50">Or</span>
          </div>
        </div>

        <div className="mt-4">
          <FormButton 
            type="button" 
            variant="outline" 
            onClick={handleGoogleAuth} 
            disabled={googleLoading}
          >
            <img src={google} alt="Google logo" className="w-5 h-5" />
            {googleLoading ? 'Connecting...' : 'Sign in with Google'}
          </FormButton>
        </div>
      </div>
    </>
  )
}

export default LoginForm
