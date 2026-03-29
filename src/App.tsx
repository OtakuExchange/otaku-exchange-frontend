import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
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
import DailyRewardButton from "./components/DailyRewardButton";

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
  const { state, pathname } = useLocation();

  const event = state?.event ?? (() => {
    try { return JSON.parse(sessionStorage.getItem(`event:${pathname}`) ?? "null"); } catch { return null; }
  })();
  const pools = state?.pools ?? (() => {
    try { return JSON.parse(sessionStorage.getItem(`pools:${pathname}`) ?? "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state?.event) {
      sessionStorage.setItem(`event:${pathname}`, JSON.stringify(state.event));
    }
    if (state?.pools) {
      sessionStorage.setItem(`pools:${pathname}`, JSON.stringify(state.pools));
    }
  }, [pathname, state]);

  if (!event) return <Navigate to="/" replace />;
  return <EventView event={event} initialPools={pools ?? undefined} initialPoolId={state?.selectedPoolId} />;
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


  useEffect(() => {
    if (prevIsSignedIn.current === false && isSignedIn) {
      navigate("/");
    }
    prevIsSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
  }, [isSignedIn]);

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
      setCash(null);
      setIsAdmin(false);
      return;
    }
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) return;
        setCash(currentUser.balance - currentUser.lockedBalance);
        setIsAdmin(currentUser.isAdmin);
      })
      .catch(console.error);
  }, [isSignedIn]);

  const navTabs: NavTab[] = topics
    .filter((topic) => !topic.hidden || isAdmin)
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
                        sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}
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
                        sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}
                      >
                        Portfolio
                      </Typography>
                    </Box>
                    <DailyRewardButton />
                    <Box sx={{ textAlign: "center", mr: 2 }}>
                      <Typography
                        sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}
                      >
                        FillyBucks
                      </Typography>
                      <Typography
                        sx={{ color: "#3DB468", fontSize: "16px", lineHeight: 1.2, fontWeight: 600 }}
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
                        sx={{ color: "#0093FD", fontWeight: 600, fontSize: "14px", height: "36px", borderRadius: "6px", padding: "8px 16px", textTransform: "none" }}
                      >
                        Login
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 1, bgcolor: "#0093FD", color: "#fff", fontWeight: 600, fontSize: "14px", height: "36px", borderRadius: "6px", padding: "8px 16px", textTransform: "none", "&:hover": { bgcolor: "#0093FD" } }}
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
            <Routes>
              {navTabs.map((tab) => (
                <Route
                  key={tab.path}
                  path={tab.path}
                  element={
                    <TopicView
                      topicId={tab.id}
                      topicLabel={tab.label}
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