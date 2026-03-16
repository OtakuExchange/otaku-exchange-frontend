import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Event, Market } from '../models/models'
import { useApi } from '../hooks/useApi'

export default function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate()
  const { fetchMarkets } = useApi()
  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    fetchMarkets(event.id).then(setMarkets).catch(console.error)
  }, [event.id])

  return (
    <Card sx={{ borderRadius: 3, height: 180, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography
          variant="h6"
          gutterBottom
          onClick={() => navigate(`/events/${event.id}`, { state: { event } })}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {event.name}
        </Typography>
        <Stack spacing={0} sx={{ mt: markets.length === 1 ? 'auto' : 1, maxHeight: 70, overflowY: 'auto' }}>
          {markets.map((market, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ height: 27, minHeight: 27, mb: '8px' }}>
              {markets.length > 1 && (
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {market.label}
                </Typography>
              )}
              <Button size="small" variant="contained" color="success" fullWidth={markets.length === 1} sx={{ height: 27, minHeight: 27, py: 0 }}>Yes</Button>
              <Button size="small" variant="contained" color="error" fullWidth={markets.length === 1} sx={{ height: 27, minHeight: 27, py: 0 }}>No</Button>
            </Stack>
          ))}
        </Stack>
      </CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: 28, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>$2M Vol.</Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          <BookmarkBorderIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  )
}
