import Typography from "@mui/material/Typography";

export function EventCardTitle({ name }: { name: string }) {
    return (
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: "#7B8996",
          opacity: 0.7,
          letterSpacing: "0.02em",
          lineHeight: 1.1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
        }}
        title={name}
      >
        {name}
      </Typography>
    );
  }