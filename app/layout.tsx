import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn(inter.variable, jetbrainsMono.variable)}>
      <body>
        {/* 包裹组件，防止 Tooltip 组件无法正常工作 */}
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
