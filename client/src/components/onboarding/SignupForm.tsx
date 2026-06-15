import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import google from '../../assets/google.png'

const SignupForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4 text-center">Sign up for Stride</h1>
      <div className="w-full max-w-md mx-auto p-4 sm:p-8 rounded-lg border-0 lg:border lg:border-purple-400">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-purple-500 outline-none"
              placeholder="Your email"
              required
            />
          </div>

        <div className="relative">
          <label
            className="block text-sm font-semibold mb-1"
            htmlFor="signup-password"
          >
            Password
          </label>

          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border px-3 py-2 pr-10 focus:border-purple-500 outline-none"
            placeholder="Your password"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9.5 text-gray-500 hover:text-black"
          >
            {showPassword ? (
              <MdVisibilityOff size={20} />
            ) : (
              <MdVisibility size={20} />
            )}
          </button>
        </div>  

        <div className="relative">
          <label
            className="block text-sm font-semibold mb-1"
            htmlFor="signup-confirm-password"
          >
            Confirm Password
          </label>

          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-md border px-3 py-2 pr-10 focus:border-purple-500 outline-none"
            placeholder="Confirm your password"
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-9.5 text-gray-500 hover:text-black"
          >
            {showConfirmPassword ? (
              <MdVisibilityOff size={20} />
            ) : (
              <MdVisibility size={20} />
            )}
          </button>
        </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-md bg-purple-600 text-white py-2 font-semibold disabled:opacity-50 hover:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
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
          className="w-full rounded-md border bg-white text-black py-2 font-semibold hover:bg-transparent hover:text-[#E0E0E0] flex items-center justify-center gap-2"
          onClick={() => console.log('Google sign-in placeholder')}
        >
          <img src={google} alt="Google logo" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
      </div>
    </>
  )
}

export default SignupForm
