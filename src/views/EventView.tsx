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
import Avatar from "@mui/material/Avatar";
import type { Comment, Event, Pool } from "../models/models";
import type { EventStake } from "../api";
import { useApi } from "../hooks/useApi";
import { useUserId } from "../contexts/UserContext";
import { useTopics } from "../contexts/TopicsContext";
import { usePoolsQuery } from "../hooks/queries/usePoolsQuery";
import TradeCard from "../components/TradeCard";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const ENABLE_COMMENTS = false;

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
  initialPools,
  initialPoolId,
}: {
  event: Event;
  initialPools?: Pool[];
  initialPoolId?: string;
}) {
  const {
    fetchComments,
    fetchEventStakes,
    postComment,
    likeComment,
    unlikeComment,
  } = useApi();
  const userId = useUserId();
  const topics = useTopics();
  const topicName = topics.find((t) => t.id === event.topicId)?.topic;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const { data: poolsData, refetch: refetchPools } = usePoolsQuery(event.id);
  const pools = poolsData ?? initialPools ?? [];
  const [selectedPool, setSelectedPool] = useState<Pool | null>(
    (initialPoolId ? initialPools?.find((p) => p.id === initialPoolId) : null) ?? initialPools?.[0] ?? null,
  );
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [infoTabIdx, setInfoTabIdx] = useState<number>(0);
  const [eventStakes, setEventStakes] = useState<EventStake[]>([]);
  const [stakesLoading, setStakesLoading] = useState(true);

  useEffect(() => {
    if (pools.length > 0 && !selectedPool) {
      setSelectedPool(pools[0]);
    }
  }, [pools]);

  useEffect(() => {
    fetchComments(event.id)
      .then(setComments)
      .catch(console.error)
      .finally(() => setCommentsLoading(false));

    fetchEventStakes(event.id, 3)
      .then(setEventStakes)
      .catch(console.error)
      .finally(() => setStakesLoading(false));
  }, [event.id]);

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
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likedByUser ? c.likes - 1 : c.likes + 1, likedByUser: !c.likedByUser }
          : c,
      ),
    );
    const action = comment.likedByUser
      ? unlikeComment(event.id, commentId)
      : likeComment(event.id, commentId);
    action.catch(() => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likes: comment.likedByUser ? c.likes + 1 : c.likes - 1, likedByUser: comment.likedByUser }
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
      direction={{ xs: "column", sm: "row" }}
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

        {pools.length > 0 && (() => {
          const totalVolume = pools.reduce((sum, p) => sum + p.volume, 0);
          return (
            <Stack sx={{ my: 2 }}>
              {pools.map((pool, i, arr) => (
                <Box key={pool.id}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => setSelectedPool(pool)}
                    sx={{
                      height: 74,
                      cursor: "pointer",
                      borderRadius: "10px",
                      px: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "20%", flexShrink: 0 }}>
                      {pool.entity?.logoPath && (
                        <Box
                          component="img"
                          src={pool.entity.logoPath}
                          sx={{ width: 48, height: 48, borderRadius: 0.5, flexShrink: 0 }}
                        />
                      )}
                      <Box>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                          {pool.entity?.name ?? pool.label}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#7B8996", fontWeight: 600 }}>
                          {(pool.volume / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} Vol.
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ flexGrow: 1, mx: 1.5, display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 }}>
                      <Box sx={{
                        width: totalVolume > 0 ? `${(pool.volume / totalVolume) * 100}%` : "0%",
                        maxWidth: "calc(100% - 130px)",
                        height: 16,
                        borderRadius: 1,
                        bgcolor: pool.entity?.color ?? "#1565c0",
                        flexShrink: 0,
                      }} />
                      <Typography sx={{
                        fontSize: "36px",
                        fontWeight: 600,
                        color: pool.entity?.color ?? "#1565c0",
                        lineHeight: 1,
                        ml: "18px",
                        flexShrink: 0,
                      }}>
                        {totalVolume > 0 ? `${Math.round((pool.volume / totalVolume) * 100)}%` : "0%"}
                      </Typography>
                    </Box>
                  </Stack>
                  {i < arr.length - 1 && <Divider sx={{ mx: "10px" }} />}
                </Box>
              ))}
            </Stack>
          );
        })()}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Top Stakes</Typography>
        {stakesLoading ? (
          <Stack spacing={1}>
            {[0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />)}
          </Stack>
        ) : eventStakes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No stakes yet.</Typography>
        ) : (() => {
          const grouped = eventStakes.reduce<Record<string, typeof eventStakes>>((acc, s) => {
            (acc[s.marketPoolId] ??= []).push(s);
            return acc;
          }, {});
          const sortedGroups = Object.values(grouped).sort((a, b) => {
            const aIdx = pools.findIndex((p) => p.id === a[0].marketPoolId);
            const bIdx = pools.findIndex((p) => p.id === b[0].marketPoolId);
            return aIdx - bIdx;
          });
          return (
            <Stack direction="row" spacing={4}>
              {sortedGroups.map((group) => (
                <Box key={group[0].marketPoolId} sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#7B8996", mb: 0.5, display: "block" }}>
                    {group[0].poolLabel}
                  </Typography>
                  <Stack spacing={1}>
                    {group.map((stake) => (
                      <Stack key={stake.id} direction="row" alignItems="center" spacing={1.5}>
                        <Avatar src={stake.avatarUrl ?? undefined} sx={{ width: 28, height: 28, fontSize: 13 }}>
                          {stake.username[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
                          {stake.username}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {(stake.amount / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          );
        })()}

        {ENABLE_COMMENTS && (
          <>
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
          </>
        )}
      </Box>
      {event.status === "open" && (
        <TradeCard
          pools={pools}
          selectedPool={selectedPool}
          onPoolChange={setSelectedPool}
          onBuySuccess={() => refetchPools()}
        />
      )}
    </Stack>
  );
}
