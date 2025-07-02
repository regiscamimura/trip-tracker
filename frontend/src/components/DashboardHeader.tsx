import { useAuth } from '@/hooks/useAuth'

interface DashboardHeaderProps {
  onLogout: () => void
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { user } = useAuth()

  return (
    <div className='bg-surface rounded-lg p-6 mb-6'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl text-brand'>Trip Tracker Dashboard</h1>
        <button
          onClick={onLogout}
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
  )
}
