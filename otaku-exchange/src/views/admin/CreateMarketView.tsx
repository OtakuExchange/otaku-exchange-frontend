import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Event, Topic } from '../../models/models'
import { useApi } from '../../hooks/useApi'

const STATUS_OPTIONS = ['open', 'closed', 'resolved']

export default function CreateMarketView() {
  const { fetchTopics, fetchEvents, createMarket } = useApi()
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [eventId, setEventId] = useState('')
  const [label, setLabel] = useState('')
  const [status, setStatus] = useState('open')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error)
  }, [])

  useEffect(() => {
    if (!topicId) { setEvents([]); setEventId(''); return }
    fetchEvents(topicId as Topic['id']).then(setEvents).catch(console.error)
  }, [topicId])

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await createMarket(eventId as Event['id'], label, status)
      setSuccess(true)
      setLabel('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create market')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !loading && !!eventId && !!label.trim()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
      <Typography variant="h5">Create Market</Typography>
      <TextField
        select
        label="Topic"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
        disabled={loading}
      >
        {topics.map((t) => (
          <MenuItem key={t.id} value={t.id}>{t.topic}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Event"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        disabled={loading || !topicId}
      >
        {events.map((ev) => (
          <MenuItem key={ev.id} value={ev.id}>{ev.name}</MenuItem>
        ))}
      </TextField>
      <TextField
        label="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={loading}
      />
      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={loading}
      >
        {STATUS_OPTIONS.map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </TextField>
      {error && <Typography color="error" variant="body2">{error}</Typography>}
      {success && <Typography color="success.main" variant="body2">Market created successfully.</Typography>}
      <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
        Add Market
      </Button>
    </Box>
  )
}
