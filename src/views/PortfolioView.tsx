import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Order } from "../models/models";
import { useApi } from "../hooks/useApi";

export default function PortfolioView() {
  const { fetchMyOrders, cancelOrder } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchMyOrders("OPEN", "LIMIT").then(setOrders).catch(console.error);
  }, []);

  function handleCancel(orderId: Order["id"]) {
    cancelOrder(orderId)
      .then(() => setOrders((prev) => prev.filter((o) => o.id !== orderId)))
      .catch(console.error);
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Portfolio
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No open orders.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {orders.map((order) => (
            <Stack
              key={order.id}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
            >
              <Typography
                variant="body2"
                sx={{ flexGrow: 1, fontWeight: "bold" }}
              >
                {order.marketLabel}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: order.side === "YES" ? "#4caf50" : "#f44336",
                  fontWeight: "bold",
                  minWidth: 32,
                }}
              >
                {order.side}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 40 }}
              >
                {order.price}¢
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleCancel(order.id)}
              >
                Cancel
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
