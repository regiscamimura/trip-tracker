import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className='min-h-screen bg-base p-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-surface rounded-lg p-6 mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h1 className='text-2xl text-brand font-bold'>
              Trip Tracker Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors'
            >
              Logout
            </button>
          </div>

          <div className='text-white'>
            <p className='mb-2'>
              <span className='text-accent'>Welcome,</span> {user?.username}!
            </p>
            {user?.email && (
              <p className='text-sm text-gray-400 mb-4'>{user.email}</p>
            )}
            <p className='text-sm text-gray-400'>
              User ID: {user?.id} | Staff: {user?.is_staff ? 'Yes' : 'No'} |
              Superuser: {user?.is_superuser ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <div className='bg-surface rounded-lg p-6'>
          <h2 className='text-xl text-brand font-semibold mb-4'>Your Trips</h2>
          <div className='text-white'>
            <p className='text-gray-400'>
              No trips found. Create your first trip!
            </p>
            {/* TODO: Add trip list component here */}
          </div>
        </div>
      </div>
    </div>
  )
}
