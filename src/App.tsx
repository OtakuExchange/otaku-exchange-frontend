import { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useUser } from "@clerk/react";
import { useApi } from "./hooks/useApi";
import ProfilePage from "./components/ProfilePage";
import PortfolioView from "./views/PortfolioView";
import LeaderboardView from "./views/LeaderboardView";
import EventView from "./views/EventView";
import TopicView from "./views/TopicView";
import type { Topic, UUID } from "./models/models";
import { TopicsContext } from "./contexts/TopicsContext";
import { UserContext } from "./contexts/UserContext";
import { RefreshCashContext } from "./contexts/RefreshCashContext";
import { RefreshTopicsContext } from "./contexts/RefreshTopicsContext";
import AdminView from "./views/AdminView";
import UserView from "./views/UserView";
import { usePoolsQuery } from "./hooks/queries/usePoolsQuery";
import CircularProgress from "@mui/material/CircularProgress";
import { useEventQuery } from "./hooks/queries/useEventQuery";
import { useNavbarTopics } from "./components/navbar/useNavbarTopics";
import { TopNavLayout } from "./components/navbar/TopNavLayout";
import { Navbar } from "./components/navbar/Navbar";
import { TopicTabs } from "./components/navbar/TopicTabs";

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

// use localStorage to persist the state of the banner
function InfoBanner() {
  const [hideInfoBanner, setHideInfoBanner] = useState(() => {
    try {
      return localStorage.getItem("hideInfoBanner") === "true";
    } catch {
      return false;
    }
  });

  const handleDismiss = useCallback(() => {
    setHideInfoBanner(true);
    localStorage.setItem("hideInfoBanner", "true");
  }, []);

  if (hideInfoBanner) return null;

  return (
    <Box
      sx={{
        bgcolor: "#1e2a3a",
        borderBottom: "1px solid #252b31",
        px: 3,
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: "13px", color: "#7B8996" }}>
        💡 <strong style={{ color: "#e8e8e8" }}>How payouts work:</strong>{" "}
        FillyB himself has gifted 500 Fillybucks to each pool. The bigger your
        steak is relative to all the other degens who guessed right, the more
        you earn. If the only bet is you betting $1 and your team wins, you get
        $500. If someone else bet $1 as well, you would get $250.
      </Typography>
      <IconButton
        size="small"
        aria-label="Dismiss payouts info"
        onClick={handleDismiss}
        sx={{ color: "#7B8996" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function App() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { fetchTopics, fetchCurrentUser } = useApi();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cash, setCash] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const prevIsSignedIn = useRef<boolean | undefined>(undefined);
  const effectiveIsAdmin = isSignedIn ? isAdmin : false;
  const { navTabs, activeTab } = useNavbarTopics({ topics, effectiveIsAdmin });

  useEffect(() => {
    if (prevIsSignedIn.current === false && isSignedIn) {
      navigate("/");
    }
    prevIsSignedIn.current = isSignedIn;
  }, [isSignedIn, navigate]);

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
  }, [isSignedIn, fetchTopics]);

  function refreshTopics() {
    fetchTopics().then(setTopics).catch(console.error);
  }

  function refreshCash() {
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) return;
        setCash(currentUser.balance - currentUser.lockedBalance);
        setIsAdmin(currentUser.isAdmin);
      })
      .catch(console.error);
  }

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) return;
        setCash(currentUser.balance - currentUser.lockedBalance);
        setIsAdmin(currentUser.isAdmin);
      })
      .catch(console.error);
  }, [isSignedIn, fetchCurrentUser]);

  return (
    <RefreshTopicsContext.Provider value={refreshTopics}>
      <RefreshCashContext.Provider value={refreshCash}>
        <UserContext.Provider value={user?.id ?? null}>
          <TopicsContext.Provider value={topics}>
            <ThemeProvider theme={darkTheme}>
              <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
                <CssBaseline />
                <TopNavLayout>
                  <Toolbar>
                    <Navbar
                      isSignedIn={isSignedIn ?? false}
                      effectiveIsAdmin={effectiveIsAdmin}
                      cash={cash}
                    />
                  </Toolbar>
                  <TopicTabs activeTab={activeTab} navTabs={navTabs} />
                </TopNavLayout>
                <Toolbar />
                <Box sx={{ height: 48 }} />
                <InfoBanner />
                <Routes>
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
                          isAdmin={isAdmin}
                        />
                      }
                    />
                  ))}
                  {navTabs.length > 0 && (
                    <Route
                      path="/"
                      element={<Navigate to={navTabs[0].path} replace />}
                    />
                  )}
                  <Route path="/events/:eventId" element={<EventViewRoute />} />
                  <Route path="/portfolio" element={<PortfolioView />} />
                  <Route path="/leaderboard" element={<LeaderboardView />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/users/:userId" element={<UserView />} />
                  <Route path="/admin/*" element={<AdminView />} />
                  <Route
                    path="*"
                    element={
                      navTabs.length > 0 ? (
                        <Navigate to={navTabs[0].path} replace />
                      ) : (
                        <Box />
                      )
                    }
                  />
                </Routes>
              </Box>
            </ThemeProvider>
          </TopicsContext.Provider>
        </UserContext.Provider>
      </RefreshCashContext.Provider>
    </RefreshTopicsContext.Provider>
  );
}

export default App;
