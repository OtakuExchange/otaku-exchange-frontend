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
import type { Comment, Event, Market, Trade } from '../models/models'
import { useApi } from '../hooks/useApi'
import { LineChart } from '@mui/x-charts/LineChart'
import TradeCard from '../components/TradeCard'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function InfoTab(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EventView({ event, initialMarkets }: { event: Event; initialMarkets?: Market[] }) {
  const { fetchComments, fetchMarkets, fetchTrades, postComment, likeComment, unlikeComment } = useApi()
  const [comments, setComments] = useState<Comment[]>([])
  const [markets, setMarkets] = useState<Market[]>(initialMarkets ?? [])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(initialMarkets?.[0] ?? null)
  const [tradesByMarket, setTradesByMarket] = useState<Record<string, Trade[]>>({})
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [infoTabIdx, setInfoTabIdx] = useState<number>(0)

  useEffect(() => {
    fetchComments(event.id).then(setComments).catch(console.error)
    const marketsPromise = initialMarkets
      ? Promise.resolve(initialMarkets)
      : fetchMarkets(event.id).then((data) => { setMarkets(data); setSelectedMarket(data[0] ?? null); return data })
    marketsPromise.then((data) => {
      Promise.all(data.map((m) => fetchTrades(m.id).then((trades) => ({ id: m.id, trades }))))
        .then((results) => setTradesByMarket(Object.fromEntries(results.map((r) => [r.id, r.trades]))))
        .catch(console.error)
    }).catch(console.error)
  }, [event.id])

  const chartData = (() => {
    const start = new Date(event.createdAt)
    const end = new Date()
    const allTimes = [start, end]
    markets.forEach((m) => (tradesByMarket[m.id] ?? []).forEach((t) => allTimes.push(new Date(t.executedAt))))
    const xData = [...new Map(allTimes.map((d) => [d.getTime(), d])).values()].sort((a, b) => a.getTime() - b.getTime())

    const series = markets.flatMap((m) => {
      const trades = tradesByMarket[m.id] ?? []
      const tradeMap = new Map(trades.map((t) => [new Date(t.executedAt).getTime(), t]))
      const yesData = xData.map((d) => tradeMap.get(d.getTime())?.yesPrice ?? null)
      if (m.isMatch) {
        const noData = xData.map((d) => tradeMap.get(d.getTime())?.noPrice ?? null)
        return [
          { label: m.entity?.abbreviatedName ?? 'Yes', data: yesData, connectNulls: true, color: m.entity?.color ?? '#40c3ff', showMark: false },
          { label: m.relatedEntity?.abbreviatedName ?? 'No', data: noData, connectNulls: true, color: m.relatedEntity?.color ?? '#ff3333', showMark: false },
        ]
      }
      return [{ label: m.label, data: yesData, connectNulls: true, color: m.entity?.color ?? undefined, showMark: false }]
    })

    return { xData, series }
  })()

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

  function handleChangeTab(event: React.SyntheticEvent, newValue: number) {
    setInfoTabIdx(newValue);
  }

  return (
    <Stack direction="row" alignItems="flex-start" sx={{ p: { xs: 2, sm: 3 }, gap: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        {event.name}
      </Typography>
      {chartData.series.length > 0 && (
        <LineChart
          xAxis={[{ data: chartData.xData, scaleType: 'time', disableLine: true, disableTicks: true }]}
          yAxis={[{ min: 0, max: 100, tickInterval: [0, 25, 50, 75, 100], disableLine: true, disableTicks: true, position: 'right', valueFormatter: (v: number) => `${v}%` }]}
          series={chartData.series}
          grid={{ horizontal: true }}
          height={250}
          margin={{ left: 20, right: 40, top: 20, bottom: 40 }}
          sx={{
            '& .MuiChartsGrid-line': {
              strokeDasharray: '4 4',
              stroke: 'rgba(255,255,255,0.15)',
            },
            '& .MuiChartsAxis-tickLabel': { fill: '#7B8996' },
            '& .MuiChartsLegend-label': { fill: '#7B8996' },
          }}
        />
      )}
      {markets.length > 0 && !markets.some((m) => m.isMatch) && (
        <Stack spacing={1} sx={{ my: 2 }}>
          {[...markets].sort((a, b) => b.tradeVolume - a.tradeVolume).map((market) => (
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
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={infoTabIdx} onChange={handleChangeTab} aria-label="info tab">
            <Tab label="Rules" />
            <Tab label="Event Description" />
          </Tabs>
        </Box>
        <InfoTab value={infoTabIdx} index={0}>
          {event.resolutionRule}
        </InfoTab>
        <InfoTab value={infoTabIdx} index={1}>
          {event.description}
        </InfoTab>
      </Box>
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