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
import type { Comment, Event, Market } from '../models/models'
import { useApi } from '../hooks/useApi'
import TradeCard from '../components/TradeCard'

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
  const { fetchComments, fetchMarkets, postComment, likeComment, unlikeComment } = useApi()
  const [comments, setComments] = useState<Comment[]>([])
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchComments(event.id).then(setComments).catch(console.error)
    fetchMarkets(event.id).then((data) => { setMarkets(data); setSelectedMarket(data[0] ?? null) }).catch(console.error)
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
    <Stack direction="row" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, gap: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        {event.name}
      </Typography>
      {markets.length > 0 && (
        <Stack spacing={1} sx={{ my: 2 }}>
          {markets.map((market) => (
            <Stack
              key={market.id}
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={() => setSelectedMarket(market)}
              sx={{ cursor: 'pointer', borderRadius: 1, px: 1, py: 0.5, bgcolor: selectedMarket?.id === market.id ? 'action.selected' : 'transparent', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Typography variant="body2" sx={{ flexGrow: 1 }}>{market.label}</Typography>
              <Button size="small" variant="contained" sx={{ bgcolor: '#1a3d2b', color: '#4caf50', '&:hover': { bgcolor: '#1f4d33' }, fontWeight: 'bold' }}>Yes</Button>
              <Button size="small" variant="contained" sx={{ bgcolor: '#3d1a1a', color: '#f44336', '&:hover': { bgcolor: '#4d1f1f' }, fontWeight: 'bold' }}>No</Button>
            </Stack>
          ))}
        </Stack>
      )}
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
      <TradeCard selectedMarket={selectedMarket} />
    </Stack>
  )
}
