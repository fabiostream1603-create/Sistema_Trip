import { Download, Smartphone, WifiOff } from 'lucide-react'
import { useNetworkStatus } from '@/features/offline/use-network-status'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  'Abra o Voyage Hub no Safari do iPhone.',
  'Toque no botao Compartilhar da barra do Safari.',
  'Escolha "Adicionar a Tela de Inicio".',
  'Confirme o nome e toque em "Adicionar".',
] as const

export function InstallPage() {
  const isOnline = useNetworkStatus()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-primary/10 p-8 text-primary">
            <Smartphone className="size-12" />
            <h1 className="mt-6 font-serif text-4xl text-foreground">
              Instalar no iPhone
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              O Voyage Hub esta configurado como PWA para ficar na tela inicial
              e abrir como se fosse um app nativo da sua viagem.
            </p>
            <div className="mt-6 rounded-[1.5rem] border bg-background px-4 py-4 text-sm text-foreground">
              <div className="flex items-center gap-2">
                {isOnline ? <Download className="size-4 text-primary" /> : <WifiOff className="size-4 text-primary" />}
                <span>{isOnline ? 'Online agora' : 'Offline agora'}</span>
              </div>
              <p className="mt-2 text-muted-foreground">
                A estrutura do app, dados recentes do roteiro, checklists e
                telas principais ficam preparadas para uso offline. Documentos
                sensiveis nao sao armazenados automaticamente.
              </p>
            </div>
          </div>
          <div>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-2xl border bg-background px-4 py-5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1">{step}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted-foreground">
              Para a melhor experiencia, abra o app online pelo menos uma vez
              para concluir o cache inicial.
            </p>
            <div className="mt-6 rounded-[1.5rem] border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">O que funciona melhor offline</p>
              <p className="mt-2">Estrutura do app, roteiro recente, proximas atividades, estado das checklists e resumos ja carregados continuam acessiveis. Novas sincronizacoes retomam quando a conexao voltar.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
