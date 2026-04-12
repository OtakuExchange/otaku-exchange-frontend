import Box from "@mui/material/Box";
import { MultiStakePercentBar } from "../../MultiStakePercentBar";
import { StakePercentBar } from "../../StakePercentBar";
import type { RowModel } from "../useRowModel";

export function DesktopStakeBar({ model }: { model: RowModel }) {
  return (
    <Box sx={{ width: "40%", flexShrink: 0, mr: 2 }}>
      {model.isMulti ? (
        <MultiStakePercentBar segments={model.segments} />
      ) : (
        <StakePercentBar
          leftPct={model.stakedPct}
          leftColor={model.myColor}
          rightColor={model.oppColor}
        />
      )}
    </Box>
  );
}

