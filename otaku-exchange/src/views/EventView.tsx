import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Event } from '../models/models'

export default function EventView({ event }: { event: Event }) {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography component="h1" variant="h4" gutterBottom>
        {event.name}
      </Typography>
    </Box>
  )
}
