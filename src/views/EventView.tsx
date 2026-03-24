import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { Comment, Event, Market, Trade } from "../models/models";
import { useApi } from "../hooks/useApi";
import { useUserId } from "../contexts/UserContext";
import { useTopics } from "../contexts/TopicsContext";
import { LineChart } from "@mui/x-charts/LineChart";
import TradeCard from "../components/TradeCard";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

function CommentItem({
  comment,
  onLike,
  isLoggedIn,
}: {
  comment: Comment;
  onLike: (id: Comment["id"]) => void;
  isLoggedIn: boolean;
}) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold">
          {comment.user.username}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleDateString()}
        </Typography>
      </Stack>
      <Typography variant="body2">{comment.content}</Typography>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
        <IconButton
          size="small"
          sx={{ p: 0.5 }}
          onClick={() => onLike(comment.id)}
          disabled={!isLoggedIn}
        >
          {comment.likedByUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          {comment.likes}
        </Typography>
      </Stack>
    </Box>
  );
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

export default function EventView({
  event,
  initialMarkets,
  initialSide,
  initialMarketId,
}: {
  event: Event;
  initialMarkets?: Market[];
  initialSide?: "YES" | "NO";
  initialMarketId?: string;
}) {
  const {
    fetchComments,
    fetchMarkets,
    fetchTrades,
    postComment,
    likeComment,
    unlikeComment,
  } = useApi();
  const userId = useUserId();
  const topics = useTopics();
  const topicName = topics.find((t) => t.id === event.topicId)?.topic;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [markets, setMarkets] = useState<Market[]>(initialMarkets ?? []);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(
    (initialMarketId ? initialMarkets?.find((m) => m.id === initialMarketId) : null) ?? initialMarkets?.[0] ?? null,
  );
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">(initialSide ?? "YES");
  const [tradesByMarket, setTradesByMarket] = useState<Record<string, Trade[]>>(
    {},
  );
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [infoTabIdx, setInfoTabIdx] = useState<number>(0);

  useEffect(() => {
    fetchComments(event.id)
      .then(setComments)
      .catch(console.error)
      .finally(() => setCommentsLoading(false));
    const marketsPromise = initialMarkets
      ? Promise.resolve(initialMarkets)
      : fetchMarkets(event.id).then((data) => {
          setMarkets(data);
          setSelectedMarket(data[0] ?? null);
          return data;
        });
    marketsPromise
      .then((data) => {
        Promise.all(
          data.map((m) =>
            fetchTrades(m.id).then((trades) => ({ id: m.id, trades })),
          ),
        )
          .then((results) =>
            setTradesByMarket(
              Object.fromEntries(results.map((r) => [r.id, r.trades])),
            ),
          )
          .catch(console.error);
      })
      .catch(console.error);
  }, [event.id]);

  const chartData = (() => {
    const start = new Date(event.createdAt);
    const end = new Date();
    const allTimes = [start, end];
    markets.forEach((m) =>
      (tradesByMarket[m.id] ?? []).forEach((t) =>
        allTimes.push(new Date(t.executedAt)),
      ),
    );
    const xData = [
      ...new Map(allTimes.map((d) => [d.getTime(), d])).values(),
    ].sort((a, b) => a.getTime() - b.getTime());

    const series = markets.flatMap((m) => {
      const trades = tradesByMarket[m.id] ?? [];
      const tradeMap = new Map(
        trades.map((t) => [new Date(t.executedAt).getTime(), t]),
      );
      const yesData = xData.map(
        (d) => tradeMap.get(d.getTime())?.yesPrice ?? null,
      );
      if (m.isMatch) {
        const noData = xData.map(
          (d) => tradeMap.get(d.getTime())?.noPrice ?? null,
        );
        return [
          {
            label: m.entity?.abbreviatedName ?? "Yes",
            data: yesData,
            connectNulls: true,
            color: m.entity?.color ?? "#40c3ff",
            showMark: false,
          },
          {
            label: m.relatedEntity?.abbreviatedName ?? "No",
            data: noData,
            connectNulls: true,
            color: m.relatedEntity?.color ?? "#ff3333",
            showMark: false,
          },
        ];
      }
      return [
        {
          label: m.entity?.abbreviatedName ?? m.label,
          data: yesData,
          connectNulls: true,
          color: m.entity?.color ?? undefined,
          showMark: false,
        },
      ];
    });

    return { xData, series };
  })();

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      await postComment(event.id, draft.trim());
      setDraft("");
      const updated = await fetchComments(event.id);
      setComments(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  }

  function handleLike(commentId: Comment["id"]) {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    // Optimistically update UI immediately
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: c.likedByUser ? c.likes - 1 : c.likes + 1,
              likedByUser: !c.likedByUser,
            }
          : c,
      ),
    );
    const action = comment.likedByUser
      ? unlikeComment(event.id, commentId)
      : likeComment(event.id, commentId);
    action.catch(() => {
      // Revert on failure
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: comment.likedByUser ? c.likes + 1 : c.likes - 1,
                likedByUser: comment.likedByUser,
              }
            : c,
        ),
      );
    });
  }

  function handleChangeTab(_event: React.SyntheticEvent, newValue: number) {
    setInfoTabIdx(newValue);
  }

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      sx={{ p: { xs: 2, sm: 3 }, gap: 3 }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {event.logoPath && (
            <Box
              component="img"
              src={event.logoPath}
              sx={{ width: 64, height: 64, borderRadius: 1, flexShrink: 0 }}
            />
          )}
          <Box>
            {topicName && (
              <Typography sx={{ color: "#7B8996", fontSize: "14px", mb: 0.5 }}>
                {topicName}
              </Typography>
            )}
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600, fontSize: "24px" }}>
              {event.name}
            </Typography>
          </Box>
        </Stack>
        {chartData.series.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", mb: 1 }}>
            {chartData.series.map((s, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, flexShrink: 0, position: "relative", top: -1 }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#7B8996" }}>{s.label}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
        {chartData.series.length > 0 && (
          <LineChart
            xAxis={[(() => {
              const HOUR = 3_600_000;
              const DAY = 86_400_000;
              const WEEK = 7 * DAY;
              const HALF_MONTH = 15 * DAY;
              const MONTH = 30 * DAY;

              const start = chartData.xData[0]?.getTime() ?? 0;
              const end = chartData.xData[chartData.xData.length - 1]?.getTime() ?? 0;
              const span = end - start;

              let intervalMs: number;
              if (span < 6 * HOUR) intervalMs = HOUR;
              else if (span < 12 * HOUR) intervalMs = 2 * HOUR;
              else if (span < DAY) intervalMs = 4 * HOUR;
              else if (span < 2 * DAY) intervalMs = 8 * HOUR;
              else if (span < 6 * DAY) intervalMs = DAY;
              else if (span < 12 * DAY) intervalMs = 2 * DAY;
              else if (span < 18 * DAY) intervalMs = 3 * DAY;
              else if (span < 6 * WEEK) intervalMs = WEEK;
              else if (span < 3 * MONTH) intervalMs = HALF_MONTH;
              else intervalMs = MONTH;

              const ticks: Date[] = [];
              const firstTick = Math.ceil(start / intervalMs) * intervalMs;
              for (let t = firstTick; t <= end && ticks.length < 5; t += intervalMs) {
                ticks.push(new Date(t));
              }

              const valueFormatter = (value: Date | number) => {
                const d = new Date(value);
                return intervalMs >= DAY
                  ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              };

              return {
                data: chartData.xData,
                scaleType: "time" as const,
                disableLine: true,
                disableTicks: true,
                tickInterval: ticks,
                valueFormatter,
              };
            })()]}
            yAxis={[
              {
                min: 0,
                max: 100,
                tickInterval: [0, 25, 50, 75, 100],
                disableLine: true,
                disableTicks: true,
                position: "right",
                valueFormatter: (v: number) => `${v}%`,
              },
            ]}
            series={chartData.series}
            grid={{ horizontal: true }}
            height={250}
            margin={{ left: 20, right: 40, top: 20, bottom: 40 }}
            slots={{ legend: () => null, tooltip: () => null }}
            sx={{
              "& .MuiChartsGrid-line": {
                strokeDasharray: "4 4",
                stroke: "rgba(255,255,255,0.15)",
              },
              "& .MuiChartsAxis-directionY .MuiChartsAxis-tickLabel": { fill: "#7B8996" },
              "& .MuiChartsAxis-directionX .MuiChartsAxis-tickLabel": { fill: "#2E3841" },
            }}
          />
        )}
        {markets.length > 0 && !markets.some((m) => m.isMatch) && (
          <Stack sx={{ my: 2 }}>
            {[...markets]
              .sort((a, b) => {
                const fa = a.forecast ?? -Infinity;
                const fb = b.forecast ?? -Infinity;
                return fb !== fa ? fb - fa : b.tradeVolume - a.tradeVolume;
              })
              .map((market, i, arr) => (
                <Box key={market.id}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => setSelectedMarket(market)}
                    sx={{
                      height: 74,
                      cursor: "pointer",
                      borderRadius: "10px",
                      px: 1,
                      position: "relative",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {market.entity?.logoPath && (
                      <Box
                        component="img"
                        src={market.entity.logoPath}
                        sx={{ width: 48, height: 48, borderRadius: 0.5, flexShrink: 0 }}
                      />
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                        {market.label}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", color: "#7B8996", fontWeight: 600 }}>
                        ${market.tradeVolume.toLocaleString()} Vol.
                      </Typography>
                    </Box>
                    <Typography sx={{
                      fontSize: market.forecast != null ? "28px" : "16px",
                      fontWeight: 600,
                      color: market.forecast != null ? "inherit" : "#7B8996",
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      pointerEvents: "none",
                    }}>
                      {market.forecast != null ? `${Math.round(market.forecast)}%` : "No bids"}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => { e.stopPropagation(); setSelectedMarket(market); setSelectedSide("YES"); }}
                      sx={{
                        height: 48,
                        px: 2,
                        borderRadius: "8px",
                        bgcolor: "#1a3d2b",
                        color: "#4caf50",
                        "&:hover": { bgcolor: "#1f4d33" },
                        fontWeight: "bold",
                        opacity: selectedMarket?.id === market.id && selectedSide === "YES" ? 1 : 0.4,
                      }}
                    >
                      Buy Yes
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => { e.stopPropagation(); setSelectedMarket(market); setSelectedSide("NO"); }}
                      sx={{
                        height: 48,
                        px: 2,
                        borderRadius: "8px",
                        bgcolor: "#3d1a1a",
                        color: "#f44336",
                        "&:hover": { bgcolor: "#4d1f1f" },
                        fontWeight: "bold",
                        opacity: selectedMarket?.id === market.id && selectedSide === "NO" ? 1 : 0.4,
                      }}
                    >
                      Buy No
                    </Button>
                  </Stack>
                  {i < arr.length - 1 && <Divider sx={{ mx: "10px" }} />}
                </Box>
              ))}
          </Stack>
        )}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={infoTabIdx}
              onChange={handleChangeTab}
              aria-label="info tab"
            >
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
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePost()}
            disabled={posting}
          />
          <Button
            variant="contained"
            onClick={handlePost}
            disabled={posting || !draft.trim()}
          >
            Post
          </Button>
        </Stack>
        {commentsLoading ? (
          <Stack spacing={2}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        ) : comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} onLike={handleLike} isLoggedIn={!!userId} />
            ))}
          </Stack>
        )}
      </Box>
      <TradeCard selectedMarket={selectedMarket} side={selectedSide} onSideChange={setSelectedSide} />
    </Stack>
  );
}
