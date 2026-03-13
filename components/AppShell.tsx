'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

interface User {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const isLoginPage = pathname === '/' || pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setUser(null)
      return
    }
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setUser)
      .catch(() => setUser(null))
  }, [pathname, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-premium">
      <Sidebar user={user} />
      <main className="flex-1 lg:ml-0 min-h-screen">{children}</main>
    </div>
  )
}
