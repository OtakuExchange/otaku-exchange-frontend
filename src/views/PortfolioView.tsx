import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Order } from "../models/models";
import { useApi } from "../hooks/useApi";

function OrderRow({ order, onCancel }: { order: Order; onCancel?: (id: Order["id"]) => void }) {
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
        sx={{ color: order.side === "YES" ? "#4caf50" : "#f44336", fontWeight: "bold", minWidth: 32 }}
      >
        {order.side}
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

function Section({ title, orders, loading, onCancel }: {
  title: string;
  orders: Order[];
  loading: boolean;
  onCancel?: (id: Order["id"]) => void;
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
            <OrderRow key={order.id} order={order} onCancel={onCancel} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function PortfolioView() {
  const { fetchMyOrders, cancelOrder } = useApi();
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [filledOrders, setFilledOrders] = useState<Order[]>([]);
  const [loadingOpen, setLoadingOpen] = useState(true);
  const [loadingFilled, setLoadingFilled] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMyOrders("OPEN", "LIMIT"),
      fetchMyOrders("PARTIALLY_FILLED", "LIMIT"),
    ])
      .then(([open, partial]) => setOpenOrders([...open, ...partial]))
      .catch(console.error)
      .finally(() => setLoadingOpen(false));

    fetchMyOrders("FULFILLED", "LIMIT")
      .then(setFilledOrders)
      .catch(console.error)
      .finally(() => setLoadingFilled(false));
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
        <Section title="Open Limit Orders" orders={openOrders} loading={loadingOpen} onCancel={handleCancel} />
        <Section title="Fulfilled Limit Orders" orders={filledOrders} loading={loadingFilled} />
      </Stack>
    </Box>
  );
}
