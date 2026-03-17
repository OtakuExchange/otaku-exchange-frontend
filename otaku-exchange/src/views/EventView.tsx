import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ReplyIcon from '@mui/icons-material/Reply'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { Comment, Event } from '../models/models'
import { useApi } from '../hooks/useApi'

function CommentItem({ comment, onLike }: { comment: Comment; onLike: (id: Comment['id']) => void }) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold">{comment.user.username}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleDateString()}
        </Typography>
      </Stack>
      <Typography variant="body2">{comment.content}</Typography>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
        <IconButton size="small" sx={{ p: 0.5 }} onClick={() => onLike(comment.id)}>
          {comment.likedByUser ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
        </IconButton>
        <Typography variant="caption" color="text.secondary">{comment.likes}</Typography>
        <IconButton size="small" sx={{ p: 0.5 }}>
          <ReplyIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  )
}

export default function EventView({ event }: { event: Event }) {
  const { fetchComments, postComment, likeComment, unlikeComment } = useApi()
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchComments(event.id).then(setComments).catch(console.error)
  }, [event.id])

  async function handlePost() {
    if (!draft.trim()) return
    setPosting(true)
    try {
      await postComment(event.id, draft.trim())
      setDraft('')
      const updated = await fetchComments(event.id)
      setComments(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setPosting(false)
    }
  }

  function handleLike(commentId: Comment['id']) {
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return
    const action = comment.likedByUser
      ? unlikeComment(event.id, commentId)
      : likeComment(event.id, commentId)
    action
      .then(() =>
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likes: c.likedByUser ? c.likes - 1 : c.likes + 1, likedByUser: !c.likedByUser }
              : c
          )
        )
      )
      .catch(console.error)
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography component="h1" variant="h4" gutterBottom>
        {event.name}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Resolution Rule
      </Typography>
      <Typography variant="body1">
        {event.resolutionRule}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Comments
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a comment..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePost()}
          disabled={posting}
        />
        <Button variant="contained" onClick={handlePost} disabled={posting || !draft.trim()}>
          Post
        </Button>
      </Stack>
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} onLike={handleLike} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
