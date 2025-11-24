import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wallet, LayoutDashboard, HelpCircle, Rocket } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || '2201';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isPayment = location.pathname.startsWith('/pay/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Stable2Pay" className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:inline">Stable2Pay.app</span>
          </button>
          <Badge variant="outline" className="bg-muted/50 hidden sm:inline-flex">
            Testnet
          </Badge>
        </div>

        <nav className="flex items-center gap-1">
          {/* Navigation links - show on all pages except payment */}
          {!isPayment && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/roadmap')}
                className={location.pathname === '/roadmap' ? 'bg-muted' : ''}
              >
                <Rocket className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Roadmap</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/faq')}
                className={location.pathname === '/faq' ? 'bg-muted' : ''}
              >
                <HelpCircle className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">FAQ</span>
              </Button>
            </>
          )}

          {/* Dashboard button */}
          {(isHome || location.pathname === '/roadmap' || location.pathname === '/faq') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          )}

          {/* Home button when on dashboard */}
          {isDashboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              Home
            </Button>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
