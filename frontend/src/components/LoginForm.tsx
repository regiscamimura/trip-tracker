import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-base flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-6'>
        <div className='text-center'>
          <h1 className='text-2xl text-brand uppercase'>Trip Tracker</h1>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded text-sm'>
              {error}
            </div>
          )}
          <input
            type='text'
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className='w-full px-3 py-2 bg-surface border border-accent text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-lg'
            placeholder='USERNAME'
          />

          <input
            type='password'
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full px-3 py-2 bg-surface border border-accent text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-lg'
            placeholder='PASSWORD'
          />

          <button
            type='submit'
            disabled={isLoading}
            className='w-full btn-outline border-brand hover:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 text-lg'
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
