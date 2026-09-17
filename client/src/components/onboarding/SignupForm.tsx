import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../../firebase'
import { EyeIcon, EyeSlashIcon } from '../../lib/icons'
import { useNavigate } from 'react-router-dom'
import google from '../../assets/google.png'
import { FormInput } from '../ui/FormInput'
import { FormButton } from '../ui/FormButton'

const SignupForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()

  const isFormValid = email.trim() !== '' && password !== '' && confirmPassword !== ''

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('Signed up:', userCredential.user)
      navigate('/onboarding')
    } catch (authError) {
      console.error(authError)
      setError('Unable to create account with email and password.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setError(null)

    const provider = new GoogleAuthProvider()
    const firebaseAuth = getAuth()

    try {
      const result = await signInWithPopup(firebaseAuth, provider)
      console.log('Signed up with Google Popup:', result.user)
      navigate('/onboarding')
    } catch (authError) {
      console.error(authError)
      setError('Unable to sign up with Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4 text-center">Sign up for Stride</h1>
      <div className="w-full max-w-md mx-auto p-4 sm:p-8 rounded-lg border border-(--border-subtle) bg-(--bg-elevated)">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="signup-email"
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
            required
          />

          <div className="relative">
            <FormInput
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-black"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <div className="relative">
            <FormInput
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-black"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <FormButton
            type="submit"
            loading={loading}
            loadingText="Creating account…"
            disabled={!isFormValid}
          >
            Create account
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

export default SignupForm
