import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import EventCard from '../components/EventCard'
import type { Event, UUID } from '../models/models'
import { useApi } from '../hooks/useApi'

export default function TopicView({ topicId }: { topicId: UUID }) {
  const [events, setEvents] = useState<Event[]>([])
  const { fetchEvents } = useApi()

  useEffect(() => {
    fetchEvents(topicId).then(setEvents).catch(console.error)
  }, [topicId])

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid key={event.id} size={{ sm: 12, md: 6, lg: 4 }}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
