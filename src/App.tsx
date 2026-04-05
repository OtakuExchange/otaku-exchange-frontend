import { useEffect, useRef, useState, useCallback } from "react";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
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
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
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
import AdminView from "./views/AdminView";
import UserView from "./views/UserView";
import DailyRewardButton from "./components/DailyRewardButton";
import { usePoolsQuery } from "./hooks/queries/usePoolsQuery";
import CircularProgress from "@mui/material/CircularProgress";
import { useEventQuery } from "./hooks/queries/useEventQuery";

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

interface NavTab {
  id: UUID;
  label: string;
  path: string;
  subtopics: Topic["subtopics"];
}

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
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { fetchTopics, fetchCurrentUser } = useApi();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cash, setCash] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const prevIsSignedIn = useRef<boolean | undefined>(undefined);
  const effectiveIsAdmin = isSignedIn ? isAdmin : false;

  useEffect(() => {
    if (prevIsSignedIn.current === false && isSignedIn) {
      navigate("/");
    }
    prevIsSignedIn.current = isSignedIn;
  }, [isSignedIn, navigate]);

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
  }, [isSignedIn, fetchTopics]);

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

  const navTabs: NavTab[] = topics
    .filter((topic) => !topic.hidden || effectiveIsAdmin)
    .map((topic) => ({
      id: topic.id,
      label: topic.topic,
      path: `/${topic.topic.toLowerCase().replace(/\s+/g, "-")}`,
      subtopics: topic.subtopics,
    }));

  const activeTab =
    navTabs.find((tab) => location.pathname.startsWith(tab.path))?.path ||
    false;

  return (
    <RefreshCashContext.Provider value={refreshCash}>
      <UserContext.Provider value={user?.id ?? null}>
        <TopicsContext.Provider value={topics}>
          <ThemeProvider theme={darkTheme}>
            <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
              <CssBaseline />
              <AppBar
                position="fixed"
                color="inherit"
                sx={{
                  bgcolor: "#16191d",
                  borderBottom: 1,
                  borderColor: "#252b31",
                }}
              >
                <Toolbar>
                  <Box
                    onClick={() => navigate("/")}
                    component="img"
                    src="https://pub-2b85124d43d84ca0b9bfb397755879db.r2.dev/cropped%20pink%20rat.png"
                    sx={{ width: 30, height: 30, mr: 1, cursor: "pointer" }}
                  />
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, fontWeight: 600 }}
                  >
                    FillyB Exchange
                  </Typography>
                  {isSignedIn && (
                    <>
                      <Box
                        onClick={() => navigate("/leaderboard")}
                        sx={{
                          textAlign: "center",
                          mr: 2,
                          cursor: "pointer",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          "&:hover": { bgcolor: "action.hover" },
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          height: "100%",
                          minHeight: "38px",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#7B8996",
                            fontSize: "12px",
                            lineHeight: 1.2,
                          }}
                        >
                          Leaderboard
                        </Typography>
                      </Box>
                      <Box
                        onClick={() => navigate("/portfolio")}
                        sx={{
                          textAlign: "center",
                          mr: 2,
                          cursor: "pointer",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          "&:hover": { bgcolor: "action.hover" },
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          height: "100%",
                          minHeight: "38px",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#7B8996",
                            fontSize: "12px",
                            lineHeight: 1.2,
                          }}
                        >
                          Portfolio
                        </Typography>
                      </Box>
                      <DailyRewardButton />
                      <Box sx={{ textAlign: "center", mr: 2 }}>
                        <Typography
                          sx={{
                            color: "#7B8996",
                            fontSize: "12px",
                            lineHeight: 1.2,
                          }}
                        >
                          FillyBucks
                        </Typography>
                        <Typography
                          sx={{
                            color: "#3DB468",
                            fontSize: "16px",
                            lineHeight: 1.2,
                            fontWeight: 600,
                          }}
                        >
                          ${((cash ?? 0) / 100).toFixed(2)}
                        </Typography>
                      </Box>
                    </>
                  )}
                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <>
                      <SignInButton mode="modal">
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            color: "#0093FD",
                            fontWeight: 600,
                            fontSize: "14px",
                            height: "36px",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            textTransform: "none",
                          }}
                        >
                          Login
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: "#0093FD",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "14px",
                            height: "36px",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            textTransform: "none",
                            "&:hover": { bgcolor: "#0093FD" },
                          }}
                        >
                          Sign Up
                        </Button>
                      </SignUpButton>
                    </>
                  )}
                </Toolbar>
                <Tabs
                  value={activeTab}
                  onChange={(_, nextPath: string) => navigate(nextPath)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  textColor="inherit"
                  slotProps={{ indicator: { style: { display: "none" } } }}
                >
                  {navTabs.map((tab) => (
                    <Tab key={tab.path} value={tab.path} label={tab.label} />
                  ))}
                </Tabs>
              </AppBar>
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
  );
}

export default App;
