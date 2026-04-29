import type { Metadata } from 'next';
import { Inter, Playfair_Display, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Agrongola 3.0 - Assistente Agronómico',
  description: 'Agrônomo virtual especialista para auxílio direto a agricultores em Angola.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={cn(playfair.variable, "font-sans", geist.variable)}>
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  );
}
