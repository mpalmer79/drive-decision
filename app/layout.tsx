import type { ReactNode } from "react";

export const metadata = {
  title: "DriveDecision",
  description: "Buy vs lease decision engine"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
