import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Calendar, DollarSign, MapPin, Plus, Sparkles, Ticket, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Eventide" }] }),
});

function Dashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const { data: events = [] } = useQuery({
    queryKey: ["events", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("events").select("*").eq("user_id", user!.id).order("event_date")).data ?? [],
  });
  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("bookings").select("*, venues(name, location, cover_image)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: notifs = [] } = useQuery({
    queryKey: ["notifs", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  const { data: recommended = [] } = useQuery({
    queryKey: ["recommended"],
    queryFn: async () => (await supabase.from("venues").select("*").order("rating", { ascending: false }).limit(3)).data ?? [],
  });

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date());
  const totalSpent = bookings.reduce((s, b) => s + Number(b.total_amount), 0);
  const next = upcoming[0];
  const daysUntil = next ? Math.ceil((new Date(next.event_date).getTime() - Date.now()) / 86400000) : null;

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-gold font-medium">Welcome back</p>
          <h1 className="font-display text-4xl font-semibold mt-1">Hello, {user.email?.split("@")[0]} 👋</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => nav({ to: "/venues" })}><MapPin className="size-4" /> Browse venues</Button>
          <Button className="bg-primary text-primary-foreground" onClick={() => nav({ to: "/events" })}><Plus className="size-4" /> New event</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard icon={<Calendar className="size-5" />} label="Total events" value={events.length} />
        <StatCard icon={<TrendingUp className="size-5" />} label="Upcoming" value={upcoming.length} />
        <StatCard icon={<Ticket className="size-5" />} label="Bookings" value={bookings.length} />
        <StatCard icon={<DollarSign className="size-5" />} label="Total spent" value={`$${totalSpent.toLocaleString()}`} />
      </div>

      {/* Countdown + notifications */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-hero text-white shadow-glow relative overflow-hidden">
          <Sparkles className="absolute top-6 right-6 size-6 text-gold" />
          {next ? (
            <>
              <p className="text-sm text-white/70">Your next event</p>
              <h2 className="font-display text-3xl font-semibold mt-1">{next.name}</h2>
              <p className="mt-1 text-white/80">{new Date(next.event_date).toDateString()} · {next.guest_count} guests</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-6xl font-semibold text-gold">{daysUntil}</span>
                <span className="text-white/70">day{daysUntil === 1 ? "" : "s"} to go</span>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-semibold">Plan your first event</h2>
              <p className="mt-2 text-white/70">Add an event to unlock smart venue recommendations and budget planning.</p>
              <Button className="mt-5 bg-gold text-gold-foreground hover:opacity-90" onClick={() => nav({ to: "/events" })}>Create event</Button>
            </>
          )}
        </div>
        <div className="p-6 rounded-2xl border bg-card shadow-card">
          <h3 className="font-display text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifs.length === 0 && <p className="text-sm text-muted-foreground">You're all caught up.</p>}
            {notifs.map((n) => (
              <div key={n.id} className="flex gap-3 text-sm">
                <span className="size-2 rounded-full bg-gold mt-1.5" />
                <div>
                  <p>{n.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold mb-5">Recommended for you</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {recommended.map((v) => (
            <Link key={v.id} to="/venues/$venueId" params={{ venueId: v.id }}
              className="group rounded-2xl overflow-hidden border bg-card shadow-card hover:shadow-glow transition-all">
              <img src={v.cover_image ?? ""} alt={v.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="p-4">
                <h3 className="font-display font-semibold">{v.name}</h3>
                <p className="text-sm text-muted-foreground">{v.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold mb-5">Recent bookings</h2>
        <div className="space-y-3">
          {bookings.slice(0, 5).map((b: any) => (
            <div key={b.id} className="flex items-center gap-4 p-4 border rounded-2xl bg-card">
              <img src={b.venues?.cover_image ?? ""} alt="" className="size-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-medium">{b.venues?.name}</p>
                <p className="text-sm text-muted-foreground">{b.venues?.location} · {b.booking_date}</p>
              </div>
              <div className="text-right">
                <p className="font-display font-semibold">${Number(b.total_amount).toLocaleString()}</p>
                <p className="text-xs capitalize text-gold">{b.status}</p>
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="p-5 rounded-2xl bg-card border shadow-card">
      <div className="size-10 rounded-xl bg-accent flex items-center justify-center text-primary mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
