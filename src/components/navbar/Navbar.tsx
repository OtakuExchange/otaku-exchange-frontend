import { useState } from "react";
import { UserButton, SignInButton, SignUpButton } from "@clerk/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DailyRewardButton from "../DailyRewardButton";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

function cashText(cash: number | null): string {
  return cash == null ? "--" : `$${(cash / 100).toFixed(2)}`;
}

function NavbarCashDisplayDesktop({ cash }: { cash: number | null }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        mr: 2,
        display: { xs: "none", md: "block" },
      }}
    >
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
        {cashText(cash)}
      </Typography>
    </Box>
  );
}

function NavbarCashDisplayMobile({ cash }: { cash: number | null }) {
  return (
    <Typography
      sx={{
        display: { xs: "block", md: "none" },
        color: "#3DB468",
        fontSize: "14px",
        lineHeight: 1,
        fontWeight: 900,
        mr: 1,
        whiteSpace: "nowrap",
      }}
    >
      {cashText(cash)}
    </Typography>
  );
}

function NavbarBrand({ onHome }: { onHome: () => void }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <Box
        onClick={onHome}
        component="img"
        src="https://pub-2b85124d43d84ca0b9bfb397755879db.r2.dev/cropped%20pink%20rat.png"
        sx={{ width: 30, height: 30, cursor: "pointer", flexShrink: 0 }}
      />
      <Typography
        variant="h6"
        component="div"
        onClick={onHome}
        sx={{
          fontWeight: 600,
          cursor: "pointer",
          display: { xs: "none", sm: "block" },
          whiteSpace: "nowrap",
        }}
      >
        FillyB Exchange
      </Typography>
    </Stack>
  );
}

function NavbarSignInButton() {
  return (
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
            padding: { xs: "8px 12px", sm: "8px 16px" },
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
            padding: { xs: "8px 12px", sm: "8px 16px" },
            textTransform: "none",
            "&:hover": { bgcolor: "#0093FD" },
          }}
        >
          Sign Up
        </Button>
      </SignUpButton>
    </>
  );
}

function NavbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        textAlign: "center",
        mr: 2,
        cursor: "pointer",
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        minHeight: "38px",
      }}
    >
      <Typography sx={{ color: "#7B8996", fontSize: "12px", lineHeight: 1.2 }}>
        {label}
      </Typography>
    </Box>
  );
}

function NavbarActionsDesktop({
  isSignedIn,
  effectiveIsAdmin,
  cash,
  onNavigate,
}: {
  isSignedIn: boolean;
  effectiveIsAdmin: boolean;
  cash: number | null;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {effectiveIsAdmin && (
        <NavbarButton label="Admin" onClick={() => onNavigate("/admin")} />
      )}
      {isSignedIn && (
        <>
          <NavbarButton
            label="Leaderboard"
            onClick={() => onNavigate("/leaderboard")}
          />
          <NavbarButton label="Portfolio" onClick={() => onNavigate("/portfolio")} />
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <DailyRewardButton variant="desktop" />
          </Box>
          <NavbarCashDisplayDesktop cash={cash} />
        </>
      )}
    </>
  );
}

function NavbarActionsMobile({
  isSignedIn,
  effectiveIsAdmin,
  cash,
  onNavigate,
}: {
  isSignedIn: boolean;
  effectiveIsAdmin: boolean;
  cash: number | null;
  onNavigate: (path: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!isSignedIn) return null;

  const items: Array<{ label: string; path: string }> = [
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Portfolio", path: "/portfolio" },
  ];
  if (effectiveIsAdmin) items.unshift({ label: "Admin", path: "/admin" });

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{ display: { xs: "flex", md: "none" } }}
    >
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Open menu"
      >
        <MenuIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {items.map((it) => (
          <MenuItem
            key={it.path}
            onClick={() => {
              setAnchorEl(null);
              onNavigate(it.path);
            }}
          >
            {it.label}
          </MenuItem>
        ))}
      </Menu>

      <DailyRewardButton variant="mobile" />
      <NavbarCashDisplayMobile cash={cash} />
    </Stack>
  );
}

export function Navbar({
  isSignedIn,
  effectiveIsAdmin,
  cash,
}: {
  isSignedIn: boolean;
  effectiveIsAdmin: boolean;
  cash: number | null;
}) {
  const navigate = useNavigate();

  return (
    <>
      <NavbarBrand onHome={() => navigate("/")} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }} />
        <NavbarActionsDesktop
          isSignedIn={isSignedIn}
          effectiveIsAdmin={effectiveIsAdmin}
          cash={cash}
          onNavigate={navigate}
        />
      <Box sx={{ display: "flex", gap: { xs: "10px", md: 0 } }}>
        <NavbarActionsMobile
          isSignedIn={isSignedIn}
          effectiveIsAdmin={effectiveIsAdmin}
          cash={cash}
          onNavigate={navigate}
        />
        {isSignedIn ? <UserButton /> : <NavbarSignInButton />}
      </Box>
    </>
  );
}
