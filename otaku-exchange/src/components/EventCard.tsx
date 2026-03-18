import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark'
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

export default function EventCard({ event, bookmarked = event.bookmarked, onBookmarkChange }: { event: Event; bookmarked?: boolean; onBookmarkChange?: (id: Event['id'], bookmarked: boolean) => void }) {
  const navigate = useNavigate()
  const { fetchMarkets, bookmarkEvent, unbookmarkEvent } = useApi()
  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    fetchMarkets(event.id).then(setMarkets).catch(console.error)
  }, [event.id])

  function handleBookmark() {
    const action = bookmarked ? unbookmarkEvent(event.id) : bookmarkEvent(event.id)
    action.then(() => onBookmarkChange?.(event.id, !bookmarked)).catch(console.error)
  }

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
        {event.format === 'binary' ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 'auto', height: 27, minHeight: 27 }}>
            <Button size="small" variant="contained" color="success" fullWidth sx={{ height: 27, minHeight: 27, py: 0 }}>
              {markets.length === 2 ? markets[0].label : 'Yes'}
            </Button>
            <Button size="small" variant="contained" color="error" fullWidth sx={{ height: 27, minHeight: 27, py: 0 }}>
              {markets.length === 2 ? markets[1].label : 'No'}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={0} sx={{ mt: 1, maxHeight: 70, overflowY: 'auto' }}>
            {markets.map((market, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ height: 27, minHeight: 27, mb: '8px' }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{market.label}</Typography>
                <Button size="small" variant="contained" color="success" sx={{ height: 27, minHeight: 27, py: 0 }}>Yes</Button>
                <Button size="small" variant="contained" color="error" sx={{ height: 27, minHeight: 27, py: 0 }}>No</Button>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: 28, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>$2M Vol.</Typography>
        <IconButton size="small" sx={{ p: 0 }} onClick={handleBookmark}>
          {bookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Card>
  )
}
