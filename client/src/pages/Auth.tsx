import SignupForm from '../components/onboarding/SignupForm'
import LoginForm from '../components/onboarding/LoginForm'
import { useState } from 'react'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
   <div className="min-h-screen h-screen flex items-center justify-center">
      <div id="pattern-div" className="w-1/2 h-full"></div>
      <div className="w-1/2 flex flex-col items-center justify-center px-24">
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
