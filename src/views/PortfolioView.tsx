import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Market, Order } from "../models/models";
import { useApi } from "../hooks/useApi";

function OrderRow({
  order,
  marketMap,
  onCancel,
}: {
  order: Order;
  marketMap: Record<string, Market>;
  onCancel?: (id: Order["id"]) => void | Promise<void>;
}) {
  const market = marketMap[order.marketId];
  const entity = market
    ? order.side === "YES"
      ? market.entity
      : market.relatedEntity ?? market.entity
    : null;
  const sideColor = entity?.color ?? (order.side === "YES" ? "#4caf50" : "#f44336");
  const sideLabel = entity?.abbreviatedName ?? order.side;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
    >
      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: "bold" }}>
        {order.marketLabel}
      </Typography>
      {order.status === "PARTIALLY_FILLED" && (
        <Typography
          variant="body2"
          sx={{ color: "#f5a623", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          Partially Filled · {order.remaining} remaining
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{ color: sideColor, fontWeight: "bold", minWidth: 32 }}
      >
        {sideLabel}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
        {order.price}¢
      </Typography>
      {onCancel && (
        <Button size="small" variant="outlined" color="error" onClick={() => onCancel(order.id)}>
          Cancel
        </Button>
      )}
    </Stack>
  );
}

function Section({ title, orders, marketMap, loading, onCancel }: {
  title: string;
  orders: Order[];
  marketMap: Record<string, Market>;
  loading: boolean;
  onCancel?: (id: Order["id"]) => void | Promise<void>;
}) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {loading ? (
        <Stack spacing={1}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No orders.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} marketMap={marketMap} onCancel={onCancel} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function PortfolioView() {
  const { fetchMyOrders, fetchMarkets, cancelOrder } = useApi();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [filledOrders, setFilledOrders] = useState<Order[]>([]);
  const [marketMap, setMarketMap] = useState<Record<string, Market>>({});
  const [loadingOpen, setLoadingOpen] = useState(true);
  const [loadingFilled, setLoadingFilled] = useState(true);
  const [loadingMarkets, setLoadingMarkets] = useState(false);

  useEffect(() => {
    setLoadingMarkets(true);
    Promise.all([
      fetchMyOrders("OPEN", "LIMIT"),
      fetchMyOrders("PARTIALLY_FILLED", "LIMIT"),
      fetchMyOrders("FULFILLED", "LIMIT"),
    ])
      .then(([open, partial, fulfilled]) => {
        const combined = [...open, ...partial];
        setOpenOrders(combined);
        setFilledOrders(fulfilled);
        setLoadingOpen(false);
        setLoadingFilled(false);

        const allOrders = [...combined, ...fulfilled];
        if (allOrders.length === 0) { setLoadingMarkets(false); return; }
        const uniqueEventIds = [...new Set(allOrders.map((o) => o.eventId))];
        return Promise.all(uniqueEventIds.map((id) => fetchMarkets(id)))
          .then((results) => {
            const map: Record<string, Market> = {};
            results.flat().forEach((m) => { map[m.id] = m; });
            setMarketMap(map);
          });
      })
      .catch(console.error)
      .finally(() => setLoadingMarkets(false));
  }, []);

  async function handleCancel(orderId: Order["id"]) {
    setOpenOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await cancelOrder(orderId);
    } catch (e) {
      console.error(e);
      setOpenOrders((prev) => {
        const cancelled = openOrders.find((o) => o.id === orderId);
        return cancelled ? [...prev, cancelled] : prev;
      });
    }
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Portfolio
      </Typography>
      <Stack spacing={4}>
        <Section title="Open Limit Orders" orders={openOrders} marketMap={marketMap} loading={loadingOpen || loadingMarkets} onCancel={handleCancel} />
        <Section title="Fulfilled Limit Orders" orders={filledOrders} marketMap={marketMap} loading={loadingFilled || loadingMarkets} />
      </Stack>
    </Box>
  );
}
