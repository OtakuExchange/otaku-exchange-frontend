import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
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
  const [events, setEvents] = useState<Event[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<UUID>>(new Set())
  const [filterBookmarked, setFilterBookmarked] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState<UUID | null>(null)
  const { fetchEvents, fetchEventsBySubtopic } = useApi()

  useEffect(() => {
    setSelectedSubtopic(null)
  }, [topicId])

  useEffect(() => {
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

  const visibleEvents = filterBookmarked ? events.filter((e) => bookmarkedIds.has(e.id)) : events

  return (
    <Stack direction="row" sx={{ minHeight: '100%' }}>
      {subtopics.length > 0 && (
        <SubtopicNav subtopics={subtopics} selected={selectedSubtopic} onSelect={setSelectedSubtopic} />
      )}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>{topicLabel}</Typography>
          <IconButton size="small" onClick={() => setFilterBookmarked((f) => !f)}>
            {filterBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          </IconButton>
        </Stack>
        <Grid container spacing={2}>
          {visibleEvents.map((event) => (
            <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <EventCard event={event} bookmarked={bookmarkedIds.has(event.id)} onBookmarkChange={handleBookmarkChange} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}
