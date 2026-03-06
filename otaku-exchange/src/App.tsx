import { useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { fetchTopics, fetchEvents } from './api'
import EventCard from './components/EventCard'
import ProfilePage from './components/ProfilePage'

const darkTheme = createTheme({
  palette: { mode: 'dark' },
})

interface NavTab {
  id: string | number
  label: string
  path: string
}

interface Event {
  eventId: string | number
  name: string
  description: string
}


function Page({ topicId }: { topicId: string | number }) {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetchEvents(topicId).then(setEvents).catch(console.error)
  }, [topicId])

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid key={event.eventId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [navTabs, setNavTabs] = useState<NavTab[]>([])

  useEffect(() => {
    fetchTopics()
      .then((data) =>
        setNavTabs(
          data.map((topic) => ({
            id: topic.id,
            label: topic.topic,
            path: `/${topic.topic.toLowerCase().replace(/\s+/g, '-')}`,
          }))
        )
      )
      .catch(console.error)
  }, [])

  const activeTab =
    navTabs.find((tab) => location.pathname.startsWith(tab.path))?.path || false

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Otaku-Exchange
            </Typography>
            <IconButton onClick={() => navigate('/profile')} sx={{ p: 0 }}>
              <Avatar />
            </IconButton>
          </Toolbar>
          <Tabs
            value={activeTab}
            onChange={(_, nextPath: string) => navigate(nextPath)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="inherit"
            indicatorColor="secondary"
          >
            {navTabs.map((tab) => (
              <Tab key={tab.path} value={tab.path} label={tab.label} />
            ))}
          </Tabs>
        </AppBar>
        <Toolbar />
        <Box sx={{ height: 48 }} />
        <Routes>
          {navTabs.map((tab) => (
            <Route key={tab.path} path={tab.path} element={<Page topicId={tab.id} />} />
          ))}
          {navTabs.length > 0 && (
            <Route path="/" element={<Navigate to={navTabs[0].path} replace />} />
          )}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={navTabs.length > 0 ? <Navigate to={navTabs[0].path} replace /> : <Box />} />
        </Routes>
      </Box>
    </ThemeProvider>
  )
}

export default App
