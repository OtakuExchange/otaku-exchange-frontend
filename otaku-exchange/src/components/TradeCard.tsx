import { useState } from 'react'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import type { Market } from '../models/models'
import { useApi } from '../hooks/useApi'
import { entityTextColor } from '../utils/entityTextColor'

export default function TradeCard({ selectedMarket }: { selectedMarket: Market | null }) {
  const { createOrder } = useApi()
  const [tradeTab, setTradeTab] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market')
  const [side, setSide] = useState<'YES' | 'NO'>('YES')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [shares, setShares] = useState('')

  function handleBuy() {
    if (!selectedMarket) return
    const price = Number(limitPrice)
    const quantity = Number(shares)
    createOrder(selectedMarket.id, side, price, quantity, price * quantity, 'LIMIT').catch(console.error)
  }

  function handleSell() {
    if (!selectedMarket) return
    const price = 100 - Number(limitPrice)
    const quantity = Number(shares)
    const flippedSide = side === 'YES' ? 'NO' : 'YES'
    createOrder(selectedMarket.id, flippedSide, price, quantity, price * quantity, 'LIMIT').catch(console.error)
  }

  return (
    <Card sx={{ width: '25%', flexShrink: 0, borderRadius: 3 }}>
      <CardContent>
        {selectedMarket && (() => {
          const displayEntity = selectedMarket.isMatch
            ? (side === 'YES' ? selectedMarket.entity : selectedMarket.relatedEntity)
            : selectedMarket.entity
          return (
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              {displayEntity?.logoPath && (
                <Box component="img" src={displayEntity.logoPath} sx={{ width: 48, height: 48, borderRadius: 0.5, flexShrink: 0 }} />
              )}
              <Typography variant="body2" fontWeight="bold">{selectedMarket.isMatch ? displayEntity?.name : selectedMarket.label}</Typography>
            </Stack>
          )
        })()}
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Tabs value={tradeTab} onChange={(_, v) => setTradeTab(v)} slotProps={{ indicator: { style: { display: 'none' } } }}>
            <Tab label="Buy" value="buy" sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '14px' }} />
            <Tab label="Sell" value="sell" sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '14px' }} />
          </Tabs>
          <Select value={orderType} onChange={(e) => setOrderType(e.target.value as 'Market' | 'Limit')} size="small" sx={{ ml: 'auto' }}>
            <MenuItem value="Market">Market</MenuItem>
            <MenuItem value="Limit">Limit</MenuItem>
          </Select>
        </Stack>
        {(() => {
          const yesColor = selectedMarket?.isMatch ? (selectedMarket.entity?.color ?? '#40c3ff') : '#4caf50'
          const noColor = selectedMarket?.isMatch ? (selectedMarket.relatedEntity?.color ?? '#ff3333') : '#f44336'
          const yesLabel = selectedMarket?.isMatch ? (selectedMarket.entity?.abbreviatedName ?? 'Yes') : 'Yes'
          const noLabel = selectedMarket?.isMatch ? (selectedMarket.relatedEntity?.abbreviatedName ?? 'No') : 'No'
          return (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button variant="contained" fullWidth onClick={() => setSide('YES')} sx={{ bgcolor: yesColor + '26', color: entityTextColor(yesColor), '&:hover': { bgcolor: yesColor + '40' }, fontWeight: 'bold', opacity: side === 'YES' ? 1 : 0.5 }}>{yesLabel}</Button>
              <Button variant="contained" fullWidth onClick={() => setSide('NO')} sx={{ bgcolor: noColor + '26', color: entityTextColor(noColor), '&:hover': { bgcolor: noColor + '40' }, fontWeight: 'bold', opacity: side === 'NO' ? 1 : 0.5 }}>{noLabel}</Button>
            </Stack>
          )
        })()}
        {tradeTab === 'buy' && (
          <Stack spacing={1}>
            {orderType === 'Limit' ? (
              <>
                <TextField size="small" fullWidth placeholder="Limit Price" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
                <TextField size="small" fullWidth placeholder="Shares" value={shares} onChange={(e) => setShares(e.target.value)} />
              </>
            ) : (
              <TextField size="small" fullWidth placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            )}
            <Button variant="contained" fullWidth onClick={handleBuy} disabled={orderType === 'Limit' && (!limitPrice || !shares)} sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#1976d2' }, fontWeight: 'bold' }}>Buy</Button>
          </Stack>
        )}
        {tradeTab === 'sell' && (
          <Stack spacing={1}>
            {orderType === 'Limit' ? (
              <>
                <TextField size="small" fullWidth placeholder="Limit Price" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
                <TextField size="small" fullWidth placeholder="Shares" value={shares} onChange={(e) => setShares(e.target.value)} />
              </>
            ) : (
              <TextField size="small" fullWidth placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            )}
            <Button variant="contained" fullWidth onClick={handleSell} disabled={orderType === 'Limit' && (!limitPrice || !shares)} sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#1976d2' }, fontWeight: 'bold' }}>Sell</Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
