import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { type ReactNode, type ReactElement, Children, isValidElement } from "react";

type EventCardLayoutProps = {
    isNew: boolean;
    children: ReactNode;
  };
  
  type EventCardLayoutCompound = ((props: EventCardLayoutProps) => ReactElement) & {
    Content: (props: { children: ReactNode }) => ReactElement;
    Footer: (props: { children: ReactNode }) => ReactElement;
  };
  
  const EventCardLayout = (({ isNew, children }: EventCardLayoutProps) => {
    let content: ReactNode = null;
    let footer: ReactNode = null;
  
    for (const child of Children.toArray(children)) {
      if (!isValidElement<{ children: ReactNode }>(child)) continue;
      const el = child as ReactElement<{ children: ReactNode }>;
      if (el.type === EventCardLayout.Content) content = el.props.children;
      if (el.type === EventCardLayout.Footer) footer = el.props.children;
    }
  
    return (
      <Card
        sx={{
          borderRadius: 3,
          height: "auto",
          minHeight: { xs: "auto", md: 210 },
          display: "flex",
          flexDirection: "column",
          position: "relative",
          ...(isNew && {
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s infinite",
              pointerEvents: "none",
              zIndex: 1,
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "200% 0" },
              "100%": { backgroundPosition: "-200% 0" },
            },
            boxShadow: "0 0 0 1.5px rgba(255,255,255,0.12)",
          }),
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            pb: { xs: 2, md: 1.5 },
            position: "relative",
            zIndex: 2,
          }}
        >
          {content}
        </CardContent>
        {footer}
      </Card>
    );
  }) as EventCardLayoutCompound;
  
  EventCardLayout.Content = function EventCardLayoutContent({
    children,
  }: {
    children: ReactNode;
  }) {
    return <>{children}</>;
  };
  
  EventCardLayout.Footer = function EventCardLayoutFooter({
    children,
  }: {
    children: ReactNode;
  }) {
    return <>{children}</>;
  };