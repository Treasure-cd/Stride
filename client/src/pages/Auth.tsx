import SignupForm from '../components/onboarding/SignupForm'
import LoginForm from '../components/onboarding/LoginForm'
import { useState } from 'react'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-dvh flex flex-col-reverse items-center justify-center lg:min-h-screen lg:flex-row lg:items-stretch">
      <div
        id="pattern-div"
        className="relative w-full h-20 lg:h-auto lg:w-1/2 overflow-hidden flex items-center justify-center"
      />

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-16 lg:px-24 py-12 lg:py-0">
        {isLogin ? <LoginForm /> : <SignupForm />}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-purple-500 hover:opacity-50 cursor-pointer"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth