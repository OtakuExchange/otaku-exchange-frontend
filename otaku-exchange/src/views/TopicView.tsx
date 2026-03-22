import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import EventCard from '../components/EventCard'
import SubtopicNav from '../components/SubtopicNav'
import type { Event, Subtopic, UUID } from '../models/models'
import { useApi } from '../hooks/useApi'

export default function TopicView({ topicId, topicLabel, subtopics }: { topicId: UUID; topicLabel: string; subtopics: Subtopic[] }) {
  const [events, setEvents] = useState<Event[] | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<UUID>>(new Set())
  const [filterBookmarked, setFilterBookmarked] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState<UUID | null>(null)
  const { fetchEvents, fetchEventsBySubtopic } = useApi()

  useEffect(() => {
    setSelectedSubtopic(null)
    setEvents(null)
  }, [topicId])

  useEffect(() => {
    setEvents(null)
    const request = selectedSubtopic ? fetchEventsBySubtopic(selectedSubtopic) : fetchEvents(topicId)
    request.then((data) => {
      setEvents(data)
      setBookmarkedIds(new Set(data.filter((e) => e.bookmarked).map((e) => e.id)))
    }).catch(console.error)
  }, [topicId, selectedSubtopic])

  function handleBookmarkChange(id: UUID, bookmarked: boolean) {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      bookmarked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const formatOrder = (format: string) => format === 'multi' ? 0 : 1

  const sortEvents = (list: Event[]) =>
    [...list].sort((a, b) => {
      const formatDiff = formatOrder(a.format) - formatOrder(b.format)
      if (formatDiff !== 0) return formatDiff
      const timeDiff = new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
      return timeDiff !== 0 ? timeDiff : b.tradeVolume - a.tradeVolume
    })

  const visibleEvents = events === null ? null : sortEvents(events)

  return (
    <Stack direction="row" sx={{ minHeight: '80vh' }}>
      {subtopics.length > 0 && (
        <SubtopicNav subtopics={subtopics} selected={selectedSubtopic} onSelect={setSelectedSubtopic} />
      )}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>{topicLabel}</Typography>
          <IconButton size="small" onClick={() => setFilterBookmarked((f) => !f)} disabled={bookmarkedIds.size === 0}>
            {filterBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          </IconButton>
        </Stack>
        {visibleEvents === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, height: '100%' }}>
            <CircularProgress size={64} sx={{ color: '#ffffff' }} />
          </Box>
        ) : visibleEvents.length === 0 || (filterBookmarked && bookmarkedIds.size === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, height: '100%', mb: 8, mr: 8 }}>
            <Typography color="text.secondary" fontWeight="bold">No Events found for {topicLabel}</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {visibleEvents.map((event) => (
              <Grid key={event.id} size={subtopics.length > 0 ? { xs: 12, sm: 12, md: 6, lg: 4 } : { xs: 12, sm: 6, md: 4, lg: 3 }}
                sx={{ display: filterBookmarked && !bookmarkedIds.has(event.id) ? 'none' : undefined }}>
                <EventCard event={event} bookmarked={bookmarkedIds.has(event.id)} onBookmarkChange={handleBookmarkChange} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Stack>
  )
}
