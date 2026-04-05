import { UserButton, SignInButton, SignUpButton } from "@clerk/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DailyRewardButton from "../DailyRewardButton";
import { useNavigate } from "react-router-dom";

const NavbarCashDisplay = ({ cash }: { cash: number | null }) => {
  return (
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
  );
};

const NavbarSignInButton = () => {
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
  );
};

const NavbarButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
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
        display: "flex",
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
};

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
      {effectiveIsAdmin && (
        <NavbarButton label="Admin" onClick={() => navigate("/admin")} />
      )}
      {isSignedIn && (
        <>
          <NavbarButton
            label="Leaderboard"
            onClick={() => navigate("/leaderboard")}
          />
          <NavbarButton
            label="Portfolio"
            onClick={() => navigate("/portfolio")}
          />
          <DailyRewardButton />
          <NavbarCashDisplay cash={cash} />
        </>
      )}
      {isSignedIn ? <UserButton /> : <NavbarSignInButton />}
    </>
  );
}
