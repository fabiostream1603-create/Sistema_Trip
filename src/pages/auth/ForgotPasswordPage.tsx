import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-xl items-center px-4 py-8">
      <Card className="w-full">
        <CardContent className="space-y-5 p-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Password reset
            </p>
            <h1 className="font-serif text-4xl">Reset flow placeholder</h1>
            <p className="text-sm text-muted-foreground">
              Phase 1 prepares the route and guardrails. Hook the actual email
              reset flow once Supabase Auth email templates are configured.
            </p>
          </div>
          <Button asChild>
            <Link to="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
