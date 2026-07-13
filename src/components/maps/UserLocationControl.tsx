import { LocateFixed, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Coordinates } from '@/lib/maps/coordinates'

type UserLocationControlProps = {
  onLocate: (coordinates: Coordinates) => void
}

export function UserLocationControl({ onLocate }: UserLocationControlProps) {
  const [isLocating, setIsLocating] = useState(false)

  function handleLocate() {
    if (!navigator.geolocation) {
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  }

  return (
    <Button
      className="w-full sm:w-auto"
      size="sm"
      type="button"
      variant="secondary"
      onClick={handleLocate}
    >
      {isLocating ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Locating
        </>
      ) : (
        <>
          <LocateFixed className="size-4" />
          My location
        </>
      )}
    </Button>
  )
}
