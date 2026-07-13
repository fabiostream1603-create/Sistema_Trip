import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-xl items-center px-4 py-8">
      <Card className="w-full">
        <CardContent className="space-y-5 p-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              New password
            </p>
            <h1 className="font-serif text-4xl">Supabase recovery callback</h1>
            <p className="text-sm text-muted-foreground">
              This route is wired for the recovery session link. The actual form
              can be added as soon as the email reset workflow is enabled.
            </p>
          </div>
          <Button asChild>
            <Link to="/login">Return to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
