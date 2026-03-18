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

const IMAGE_BASE_URL = 'https://pub-d71a95addc384e0ebf552fdeaaec8834.r2.dev/'

function entityTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.3 ? '#ffffff' : hex
}

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
        {event.format === 'binary' && markets.length === 2 ? (
          <Stack sx={{ mb: 1 }} onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>
            {markets.map((market, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ height: 36, minHeight: 36, mb: i === 0 ? '4px' : 0, cursor: 'pointer' }}>
                {market.entity
                  ? <Box component="img" src={IMAGE_BASE_URL + market.entity.logoPath} sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: 0.5 }} />
                  : <Box sx={{ width: 24, height: 24, flexShrink: 0 }} />
                }
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{market.entity ? market.entity.name : market.label}</Typography>
                <Typography variant="body2" color="text.secondary">50%</Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography
            variant="h6"
            gutterBottom
            onClick={() => navigate(`/events/${event.id}`, { state: { event } })}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {event.name}
          </Typography>
        )}
        {event.format === 'binary' ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 'auto', height: 27, minHeight: 27 }}>
            {markets.length === 2 ? markets.map((market, i) => (
              <Button
                key={i}
                size="small"
                variant="contained"
                color={market.entity ? undefined : i === 0 ? 'success' : 'error'}
                fullWidth
                sx={{
                  height: 27, minHeight: 27, py: 0,
                  ...(market.entity && {
                    bgcolor: market.entity.color + '26',
                    color: entityTextColor(market.entity.color),
                    '&:hover': { bgcolor: market.entity.color + '40' },
                  }),
                }}
              >
                {market.label}
              </Button>
            )) : (
              <>
                <Button size="small" variant="contained" color="success" fullWidth sx={{ height: 27, minHeight: 27, py: 0 }}>Yes</Button>
                <Button size="small" variant="contained" color="error" fullWidth sx={{ height: 27, minHeight: 27, py: 0 }}>No</Button>
              </>
            )}
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
