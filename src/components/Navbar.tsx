import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Heart, LayoutDashboard, LogOut, MapPin, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="size-8 rounded-lg bg-hero shadow-glow flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </span>
          Eventide
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <Link to="/venues" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            <span className="flex items-center gap-1.5"><MapPin className="size-4" /> Venues</span>
          </Link>
          {user && (
            <>
              <Link to="/events" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
                <span className="flex items-center gap-1.5"><Calendar className="size-4" /> My Events</span>
              </Link>
              <Link to="/favorites" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
                <span className="flex items-center gap-1.5"><Heart className="size-4" /> Saved</span>
              </Link>
            </>
          )}
        </nav>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full gap-2">
                <div className="size-8 rounded-full bg-hero text-white flex items-center justify-center text-sm font-semibold">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm">{user.email?.split("@")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => nav({ to: "/dashboard" })}>
                <LayoutDashboard className="mr-2 size-4" /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav({ to: "/events" })}>
                <Calendar className="mr-2 size-4" /> My events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav({ to: "/favorites" })}>
                <Heart className="mr-2 size-4" /> Saved venues
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => { await signOut(); nav({ to: "/" }); }}>
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => nav({ to: "/auth" })}>Sign in</Button>
            <Button className="bg-hero text-white shadow-glow hover:opacity-90" onClick={() => nav({ to: "/auth" })}>
              <User className="size-4" /> Get started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
