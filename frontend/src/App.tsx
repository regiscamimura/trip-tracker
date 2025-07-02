import { AuthProvider } from '@/contexts/AuthContext.tsx'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='min-h-screen bg-base flex items-center justify-center'>
        <div className='text-brand text-xl'>Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
