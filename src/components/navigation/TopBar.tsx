import { Compass, LogOut, MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/supabase/client'

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { session } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase?.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="glass-panel sticky top-3 z-30 rounded-[2rem] border px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <Link to="/trips" className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Compass className="size-5" />
          </div>
          <div>
            <p className="font-serif text-lg leading-none">Voyage Hub</p>
            <p className="text-xs text-muted-foreground">
              Mediterranean planning, one calm place
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            {resolvedTheme === 'dark' ? (
              <SunMedium className="size-5" />
            ) : (
              <MoonStar className="size-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Avatar>
            <AvatarFallback>
              {session?.user.email?.slice(0, 2).toUpperCase() ?? 'VH'}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="size-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
