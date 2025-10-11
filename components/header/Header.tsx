import { Button } from '@/components/ui/button'
import { ExtendedUser } from '@/next-auth'
import { LoginButton } from '../auth/login-button'
import { RegisterButton } from '../auth/register-button'
import Link from 'next/link'
import { UserButton } from '../auth/user-button'
import { NotificationsPopover } from './Notifications'
import { en } from "@/en";


interface HeaderProps {
  user: ExtendedUser | null
}



export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="text-xl font-bold text-orange-600 hover:text-orange-700">{en.app.name}</h1>
            <p
              className='text-sm text-gray-500'
            >by{' '}
              <span
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                {en.author.name}
              </span>
            </p>
          </Link>

        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NotificationsPopover />
              <UserButton />
            </>
          ) : (
            <>
              <LoginButton>
                <Button variant="ghost">Login</Button>
              </LoginButton>
              <RegisterButton>
                <Button variant="ghost"
                  className='bg-orange-600 hover:bg-orange-700 text-gray-50 hover:text-white'
                >Register</Button>
              </RegisterButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
