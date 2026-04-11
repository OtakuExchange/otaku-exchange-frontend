import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCentsCompact } from "../../utils/formatMoney";

export function StakeLine({
  label,
  loading,
  username,
  avatarUrl,
  amountCents,
}: {
  label: string;
  loading: boolean;
  username: string | null;
  avatarUrl: string | null;
  amountCents: number | null;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ minHeight: 18 }}
    >
      <Typography
        variant="caption"
        sx={{ color: "#7B8996", width: 54, flexShrink: 0 }}
      >
        {label}
      </Typography>

      {loading ? (
        <>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width={110} sx={{ flexGrow: 1 }} />
          <Skeleton variant="text" width={64} />
        </>
      ) : (
        <>
          <Avatar
            src={avatarUrl ?? undefined}
            sx={{ width: 18, height: 18, fontSize: 10 }}
          >
            {(username ?? "?").slice(0, 1).toUpperCase()}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexGrow: 1,
            }}
          >
            {username ?? "—"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            {amountCents != null ? formatCentsCompact(amountCents) : "—"}
          </Typography>
        </>
      )}
    </Stack>
  );
}
