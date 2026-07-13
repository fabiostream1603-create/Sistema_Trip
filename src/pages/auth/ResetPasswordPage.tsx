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
              Nova senha
            </p>
            <h1 className="font-serif text-4xl">Retorno de recuperacao do Supabase</h1>
            <p className="text-sm text-muted-foreground">
              Esta rota ja recebe o link de recuperacao. O formulario final de
              troca de senha pode ser ligado assim que esse fluxo for habilitado.
            </p>
          </div>
          <Button asChild>
            <Link to="/login">Voltar para o login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
