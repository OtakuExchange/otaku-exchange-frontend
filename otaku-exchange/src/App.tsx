import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react'
import { useApi } from './hooks/useApi'
import ProfilePage from './components/ProfilePage'
import AdminView from './views/AdminView'
import EventView from './views/EventView'
import TopicView from './views/TopicView'
import type { UUID } from './models/models'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const darkTheme = createTheme({
  palette: { mode: 'dark' },
})

interface NavTab {
  id: UUID
  label: string
  path: string
}


function EventViewRoute() {
  const { state } = useLocation()
  return <EventView event={state?.event} />
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { fetchTopics } = useApi()
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
  }, [isSignedIn])

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
            {isSignedIn ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link label="Administration" labelIcon={<AdminPanelSettingsIcon/>} href="/admin" />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button color="inherit" variant="outlined" size="small">Login</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button color="inherit" variant="outlined" size="small" sx={{ ml: 1 }}>Sign Up</Button>
                </SignUpButton>
              </>
            )}
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
            <Route key={tab.path} path={tab.path} element={<TopicView topicId={tab.id} />} />
          ))}
          {navTabs.length > 0 && (
            <Route path="/" element={<Navigate to={navTabs[0].path} replace />} />
          )}
          <Route path="/events/:eventId" element={<EventViewRoute />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/*" element={<AdminView />} />
          <Route path="*" element={navTabs.length > 0 ? <Navigate to={navTabs[0].path} replace /> : <Box />} />
        </Routes>
      </Box>
    </ThemeProvider>
  )
}

export default App
