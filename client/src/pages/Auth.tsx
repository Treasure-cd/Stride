import SignupForm from '../components/onboarding/SignupForm'
import LoginForm from '../components/onboarding/LoginForm'
import { useState } from 'react'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen lg:h-screen flex flex-col-reverse items-center justify-center lg:flex-row lg:items-stretch">
      <div
        id="pattern-div"
        className="relative w-full h-20 lg:w-1/2 lg:h-full bg-purple-200 overflow-hidden flex items-center justify-center"
      >
        <style>{`
          @keyframes strideIn {
            0%   { opacity: 0; transform: translateX(-60%) scale(0.6); }
            16%  { opacity: 1; transform: translateX(4%) scale(1.06); }
            22%  { opacity: 1; transform: translateX(0) scale(1); }
            70%  { opacity: 1; transform: translateX(0) scale(1); }
            85%  { opacity: 0; transform: translateX(60%) scale(0.6); }
            100% { opacity: 0; transform: translateX(-60%) scale(0.6); }
          }
        `}</style>
        <div className="hidden lg:flex flex-col items-center text-center px-10">
          <span
            className="text-7xl font-bold"
            style={{ animation: 'strideIn 3.6s ease-in-out infinite' }}
          >
            Stride
          </span>
          <p className="mt-4 text-base">
            The study planner that works with your brain.
          </p>
        </div>
      </div>

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