import { useState } from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import CreateTopicView from './admin/CreateTopicView'
import CreateEventView from './admin/CreateEventView'
import CreateMarketView from './admin/CreateMarketView'

function AdminSidebar() {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(true)

  return (
    <Box sx={{ width: 220, flexShrink: 0, borderRight: 1, borderColor: 'divider', minHeight: '100%' }}>
      <List dense disablePadding>
        <ListItemButton onClick={() => setCreateOpen((o) => !o)}>
          <AddCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          <ListItemText primary="Create" />
          {createOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={createOpen} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/create/topic')}>
              <ListItemText primary="Topic" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/create/event')}>
              <ListItemText primary="Event" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/admin/create/market')}>
              <ListItemText primary="Market" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  )
}

export default function AdminView() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom>Administration</Typography>
        <Routes>
          <Route path="create/topic" element={<CreateTopicView />} />
          <Route path="create/event" element={<CreateEventView />} />
          <Route path="create/market" element={<CreateMarketView />} />
          <Route path="*" element={<Navigate to="/admin/create/topic" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}
