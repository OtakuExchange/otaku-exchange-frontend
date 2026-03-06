import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function ProfilePage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Profile
      </Typography>
    </Box>
  )
}
