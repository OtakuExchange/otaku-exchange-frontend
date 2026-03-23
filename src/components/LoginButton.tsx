import { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

export default function LoginButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button color="inherit" variant="outlined" size="small" onClick={() => setOpen(true)}>
        Login
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Welcome to Otaku-Exchange</DialogTitle>
        <DialogContent />
      </Dialog>
    </>
  )
}
