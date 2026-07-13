import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  placeFormSchema,
  type PlaceFormInputValues,
  type PlaceFormValues,
} from '@/features/places/place-schema'
import type { Destination } from '@/types/trips'
import type { Place } from '@/types/places'

export function PlaceForm({
  destinations,
  isPending,
  onCancel,
  onSubmit,
  place,
}: {
  destinations: Destination[]
  isPending: boolean
  onCancel?: () => void
  onSubmit: (values: PlaceFormValues) => Promise<void> | void
  place?: Place | null
}) {
  const form = useForm<PlaceFormInputValues, undefined, PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      address: '',
      category: 'attraction',
      city: '',
      country: '',
      destination_id: '',
      is_favorite: false,
      latitude: 0,
      longitude: 0,
      notes: '',
      phone: '',
      price_level: '',
      title: '',
      visit_status: 'saved',
      website_url: '',
    },
  })

  useEffect(() => {
    form.reset({
      address: place?.address ?? '',
      category: place?.category ?? 'attraction',
      city: place?.city ?? '',
      country: place?.country ?? '',
      destination_id: place?.destination_id ?? '',
      is_favorite: place?.is_favorite ?? false,
      latitude: place?.latitude ?? 0,
      longitude: place?.longitude ?? 0,
      notes: place?.notes ?? '',
      phone: place?.phone ?? '',
      price_level: place?.price_level ?? '',
      title: place?.title ?? '',
      visit_status: place?.visit_status ?? 'saved',
      website_url: place?.website_url ?? '',
    })
  }, [form, place])

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
      <Field>
        <Label htmlFor="title">Place name</Label>
        <Input id="title" {...form.register('title')} />
        <ErrorText message={form.formState.errors.title?.message} />
      </Field>

      <Field>
        <Label htmlFor="category">Category</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="category"
          {...form.register('category')}
        >
          <option value="attraction">Attraction</option>
          <option value="restaurant">Restaurant</option>
          <option value="beach">Beach</option>
          <option value="viewpoint">Viewpoint</option>
          <option value="activity">Activity</option>
          <option value="shopping">Shopping</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="hospital">Hospital</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field>
        <Label htmlFor="destination_id">Destination</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="destination_id"
          {...form.register('destination_id')}
        >
          <option value="">No linked destination</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.id}>
              {destination.city}, {destination.country}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <Label htmlFor="visit_status">Status</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="visit_status"
          {...form.register('visit_status')}
        >
          <option value="saved">Saved</option>
          <option value="must_visit">Must visit</option>
          <option value="visited">Visited</option>
          <option value="skipped">Skipped</option>
        </select>
      </Field>

      <Field>
        <Label htmlFor="latitude">Latitude</Label>
        <Input id="latitude" step="0.000001" type="number" {...form.register('latitude')} />
        <ErrorText message={form.formState.errors.latitude?.message} />
      </Field>

      <Field>
        <Label htmlFor="longitude">Longitude</Label>
        <Input id="longitude" step="0.000001" type="number" {...form.register('longitude')} />
        <ErrorText message={form.formState.errors.longitude?.message} />
      </Field>

      <Field>
        <Label htmlFor="city">City</Label>
        <Input id="city" {...form.register('city')} />
      </Field>

      <Field>
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...form.register('country')} />
      </Field>

      <div className="md:col-span-2">
        <Field>
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...form.register('address')} />
        </Field>
      </div>

      <Field>
        <Label htmlFor="website_url">Website</Label>
        <Input id="website_url" placeholder="https://example.com" {...form.register('website_url')} />
        <ErrorText message={form.formState.errors.website_url?.message} />
      </Field>

      <Field>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register('phone')} />
      </Field>

      <Field>
        <Label htmlFor="price_level">Price level</Label>
        <select
          className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
          id="price_level"
          {...form.register('price_level')}
        >
          <option value="">Not set</option>
          <option value="1">$</option>
          <option value="2">$$</option>
          <option value="3">$$$</option>
          <option value="4">$$$$</option>
        </select>
        <ErrorText message={form.formState.errors.price_level?.message?.toString()} />
      </Field>

      <label className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm">
        <input type="checkbox" {...form.register('is_favorite')} />
        <span>Mark as favorite</span>
      </label>

      <div className="md:col-span-2">
        <Field>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            id="notes"
            {...form.register('notes')}
          />
        </Field>
      </div>

      <div className="md:col-span-2 flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={isPending} type="submit">
          {place ? 'Save changes' : 'Save place'}
        </Button>
      </div>
    </form>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}
