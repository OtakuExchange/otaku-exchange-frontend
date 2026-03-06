import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { fetchMarkets } from '../api'

interface Event {
  eventId: string | number
  name: string
  description: string
}

interface Market {
  label: string
}

export default function EventCard({ event }: { event: Event }) {
  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    fetchMarkets(event.eventId).then(setMarkets).catch(console.error)
  }, [event.eventId])

  return (
    <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {event.name}
        </Typography>
        <Stack spacing={1} sx={{ mt: markets.length === 1 ? 'auto' : 1, maxHeight: 90, overflowY: 'auto' }}>
          {markets.map((market, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1}>
              {markets.length > 1 && (
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {market.label}
                </Typography>
              )}
              <Button size="small" variant="contained" color="success" fullWidth={markets.length === 1}>Yes</Button>
              <Button size="small" variant="contained" color="error" fullWidth={markets.length === 1}>No</Button>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
