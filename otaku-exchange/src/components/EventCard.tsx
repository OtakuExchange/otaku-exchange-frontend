import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Event, Market } from '../models/models'
import { useApi } from '../hooks/useApi'


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
  const [markets, setMarkets] = useState<Market[] | null>(null)
  const isMatch = markets !== null && event.format === 'binary' && markets.length === 2

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
        {markets === null ? (
          <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: 'center' }}>
            <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        ) : isMatch ? (
          <Stack sx={{ mb: 1 }} onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>
            {markets.map((market, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ height: 36, minHeight: 36, mb: i === 0 ? '4px' : 0, cursor: 'pointer' }}>
                {market.entity
                  ? <Box component="img" src={market.entity.logoPath} sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: 0.5 }} />
                  : <Box sx={{ width: 24, height: 24, flexShrink: 0 }} />
                }
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{market.entity ? market.entity.name : market.label}</Typography>
                <Typography variant="body2" color="text.secondary">50%</Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: '10px', cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>
            {event.logoPath && <Box component="img" src={event.logoPath} sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 0.5 }} />}
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', fontSize: '14px', '&:hover': { textDecoration: 'underline' } }}
            >
              {event.name}
            </Typography>
          </Stack>
        )}
        {markets !== null && isMatch ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 'auto', height: 40, minHeight: 40 }}>
            {markets.map((market, i) => {
              const defaultColor = i === 0 ? '#40c3ff' : '#ff3333'
              const entityColor = market.entity?.color ?? defaultColor
              return (
                <Button
                  key={i}
                  size="small"
                  variant="contained"
                  fullWidth
                  sx={{
                    height: 40, minHeight: 40, py: 0, fontWeight: 'bold',
                    bgcolor: entityColor + '26',
                    color: entityTextColor(entityColor),
                    '&:hover': { bgcolor: entityColor + '40' },
                  }}
                  onClick={() => navigate(`/events/${event.id}`, { state: { event } })}
                >
                  {market.entity?.abbreviatedName ?? market.label}
                </Button>
              )
            })}
          </Stack>
        ) : (
          <Stack spacing={0} sx={{ mt: 1, maxHeight: 70, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
            {(markets ?? []).map((market, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ height: 27, minHeight: 27, mb: '8px' }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{market.label}</Typography>
                <Button size="small" variant="contained" sx={{ height: 27, minHeight: 27, py: 0, bgcolor: '#1a3d2b', color: '#4caf50', '&:hover': { bgcolor: '#1f4d33' } }} onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>Yes</Button>
                <Button size="small" variant="contained" sx={{ height: 27, minHeight: 27, py: 0, bgcolor: '#3d1a1a', color: '#f44336', '&:hover': { bgcolor: '#4d1f1f' } }} onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>No</Button>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: 28 }}>
        <Typography variant="caption" sx={{ flexGrow: 1, color: '#7B8996' }}>$2M Vol.</Typography>
        <IconButton size="small" sx={{ p: 0, color: '#7B8996' }} onClick={handleBookmark}>
          {bookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Card>
  )
}
