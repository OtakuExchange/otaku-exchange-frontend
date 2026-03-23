import { useEffect, useState } from "react";
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
import AdminView from "./views/AdminView";
import PortfolioView from "./views/PortfolioView";
import EventView from "./views/EventView";
import TopicView from "./views/TopicView";
import type { Topic, UUID } from "./models/models";
import { TopicsContext } from "./contexts/TopicsContext";
import { UserContext } from "./contexts/UserContext";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#16191d", paper: "#16191d" },
  },
  typography: {
    fontFamily: "sans-serif",
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
  return <EventView event={state?.event} initialMarkets={state?.markets} />;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { fetchTopics, fetchCurrentUser, fetchMyOrders, fetchPortfolioTotal } =
    useApi();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cash, setCash] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<number | null>(null);

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error);
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setCash(null);
      setPortfolio(null);
      return;
    }
    Promise.all([
      fetchCurrentUser(),
      fetchMyOrders("OPEN", "LIMIT"),
      fetchPortfolioTotal(),
    ])
      .then(([currentUser, orders, total]) => {
        if (!currentUser) return;
        const locked = orders.reduce((sum, o) => sum + o.lockedAmount, 0);
        setCash(currentUser.balance - locked);
        setPortfolio(total);
      })
      .catch(console.error);
  }, [isSignedIn]);

  const navTabs: NavTab[] = topics.map((topic) => ({
    id: topic.id,
    label: topic.topic,
    path: `/${topic.topic.toLowerCase().replace(/\s+/g, "-")}`,
    subtopics: topic.subtopics,
  }));

  const activeTab =
    navTabs.find((tab) => location.pathname.startsWith(tab.path))?.path ||
    false;

  return (
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
                  FillyBExchange
                </Typography>
                {isSignedIn && (
                  <>
                    <Box
                      onClick={() => navigate("/portfolio")}
                      sx={{ textAlign: "center", mr: 2, cursor: "pointer" }}
                    >
                      <Typography
                        sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}
                      >
                        Portfolio
                      </Typography>
                      <Typography
                        sx={{ color: "#3DB468", fontSize: "16px", lineHeight: 1.2, fontWeight: 600 }}
                      >
                        {portfolio ?? 0}¢
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", mr: 2 }}>
                      <Typography
                        sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}
                      >
                        Cash
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
                  <UserButton>
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="Administration"
                        labelIcon={<AdminPanelSettingsIcon />}
                        href="/admin"
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <Button
                        variant="text"
                        size="small"
                        sx={{ color: "#0093FD", fontWeight: 600, fontFamily: "sans-serif", fontSize: "14px", height: "36px", borderRadius: "6px", padding: "8px 16px", textTransform: "none" }}
                      >
                        Login
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 1, bgcolor: "#0093FD", color: "#fff", fontWeight: 600, fontFamily: "sans-serif", fontSize: "14px", height: "36px", borderRadius: "6px", padding: "8px 16px", textTransform: "none", "&:hover": { bgcolor: "#0093FD" } }}
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
  );
}

export default App;
