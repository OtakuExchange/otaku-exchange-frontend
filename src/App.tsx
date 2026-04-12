import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useUser } from "@clerk/react";
import ProfilePage from "./components/ProfilePage";
import PortfolioView from "./views/PortfolioView";
import LeaderboardView from "./views/LeaderboardView";
import EventView from "./views/EventView";
import TopicView from "./views/TopicView";
import type { UUID } from "./models/models";
import { UserContext } from "./contexts/UserContext";
import AdminView from "./views/AdminView";
import HistoryView from "./views/HistoryView.tsx";
import UserView from "./views/UserView";
import { usePoolsQuery } from "./api/pool/pool.queries";
import CircularProgress from "@mui/material/CircularProgress";
import { useEventQuery } from "./api/events/events.queries";
import { useNavbarTopics } from "./components/navbar/useNavbarTopics";
import { TopNavLayout } from "./components/navbar/TopNavLayout";
import { Navbar } from "./components/navbar/Navbar";
import { TopicTabs } from "./components/navbar/TopicTabs";
import { useUserQuery } from "./api/user/user.queries";
import { useTopicsQuery } from "./api/topic/topic.queries";
import { InfoBanner } from "./components/InfoBanner";
import Stack from "@mui/material/Stack";
import { AdminGuard } from "./components/guard/AdminGuard.tsx";
import { SignedInGuard } from "./components/guard/SignedInGuard.tsx";
import { RouteAnalyticsListener } from "./analytics/RouteAnalyticsListener";
import { trackEvent } from "./analytics/ga4";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#16191d", paper: "#16191d" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: "#16191d", backgroundImage: "none" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { fontSize: "14px", textTransform: "none", fontWeight: 600 },
      },
    },
    MuiTouchRipple: {
      styleOverrides: {
        root: { display: "none" },
      },
    },
  },
});

function EventViewRoute() {
  const { state } = useLocation();
  const eventId = useParams().eventId as UUID;
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
  } = useEventQuery(eventId);
  const {
    data: pools,
    isLoading: poolsLoading,
    isError: poolsError,
  } = usePoolsQuery(eventId);

  useEffect(() => {
    const source = (state as any)?.source as string | undefined;
    if (source) return; // click-side tracking already sent
    trackEvent("event_opened", {
      event_id: eventId,
      source: "direct",
      selected_pool_id: (state as any)?.selectedPoolId,
    });
  }, [eventId, state]);

  if (eventLoading || poolsLoading) return <CircularProgress />;
  if (eventError || poolsError || !event || !pools)
    return <Navigate to="/" replace />;
  return (
    <EventView
      event={event}
      initialPools={pools ?? undefined}
      initialPoolId={state?.selectedPoolId}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { data: topics = [] } = useTopicsQuery();
  const { data: userData } = useUserQuery();
  const prevIsSignedIn = useRef<boolean | undefined>(undefined);
  const effectiveIsAdmin = isSignedIn === true && (userData?.isAdmin ?? false);
  const { navTabs, activeTab } = useNavbarTopics({ topics, effectiveIsAdmin });

  useEffect(() => {
    if (prevIsSignedIn.current === false && isSignedIn) {
      navigate("/");
    }
    prevIsSignedIn.current = isSignedIn;
  }, [isSignedIn, navigate]);

  return (
    <UserContext.Provider value={user?.id ?? null}>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <CssBaseline />
          <RouteAnalyticsListener />
          <TopNavLayout>
            <Toolbar>
              <Navbar isSignedIn={isSignedIn ?? false} />
            </Toolbar>
            <TopicTabs activeTab={activeTab} navTabs={navTabs} />
          </TopNavLayout>
          <Toolbar />
          <Box sx={{ height: 48 }} />
          <Stack direction="column" spacing={0.5} sx={{ mb: 1 }}>
            <InfoBanner
              storageKey="end-of-service"
              variant="warning"
              message={
                <Typography sx={{ fontSize: "13px", color: "error.main" }}>
                  ⚠️{" "}
                  We will be wrapping up the FillyB Exchange on May 6th after AML finals is done.
                  Top 3 Leaderboard prizes will be awarded shortly after, stay tuned for FillyB Wrapped.
                </Typography>
              }
            />
            <InfoBanner
              storageKey="payouts"
              variant="info"
              message={
                <Typography sx={{ fontSize: "13px", color: "#7B8996" }}>
                  💡{" "}
                  <strong style={{ color: "#e8e8e8" }}>
                    How payouts work:
                  </strong>{" "}
                  Your slice of the winning pool is the percentage of the total
                  volume you will win if the FillyGod chooses your team. You
                  should aim to bet according to how much faith you have in your
                  team. The FillyGod himself will double your first bet on an
                  event up to $500.
                </Typography>
              }
            />
          </Stack>

          <Routes>
            {/* Topic Routes */}
            {navTabs.map((tab) => (
              <Route
                key={tab.path}
                path={`${tab.path}/*`}
                element={
                  <TopicView
                    topicId={tab.id}
                    topicLabel={tab.label}
                    topicPath={tab.path}
                    subtopics={tab.subtopics}
                    isAdmin={effectiveIsAdmin}
                  />
                }
              />
            ))}

            {/* Public Routes */}
            <Route path="/events/:eventId" element={<EventViewRoute />} />
            <Route path="/leaderboard" element={<LeaderboardView />} />
            <Route path="/portfolio" element={<PortfolioView />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history/*" element={<HistoryView/>}/>
            <Route path="*" element={navTabs.length > 0 ? <Navigate to={navTabs[0].path} replace /> : <Box />}/>

            {/* Signed In Routes */}
            <Route element={<SignedInGuard />}>
              <Route path="/users/:userId" element={<UserView />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminGuard />}>
              <Route path="/admin/*" element={<AdminView />} />
            </Route>

            {/* Fallback Route */}
            {navTabs.length > 0 && (
              <Route
                path="/"
                element={<Navigate to={navTabs[0].path} replace />}
              />
            )}
          </Routes>
        </Box>
      </ThemeProvider>
    </UserContext.Provider>
  );
}

export default App;
