import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, MapPin, Search, Sparkles, Star, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { VenueCard } from "@/components/VenueCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const { data: venues = [] } = useQuery({
    queryKey: ["venues", "featured"],
    queryFn: async () => {
      const { data } = await supabase.from("venues").select("*").order("rating", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-[0.97]" />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920')", backgroundSize: "cover" }} />
        <div className="relative container mx-auto px-6 py-24 md:py-36 text-white">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium border border-white/20">
              <Sparkles className="size-3.5 text-gold" /> Smart venue recommendations powered by AI
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold leading-[1.05] text-balance">
              Where unforgettable <em className="not-italic text-gold">events</em> begin.
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Discover hand-picked venues, plan every detail, and book in seconds — from intimate dinners to 500-guest galas.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); nav({ to: "/venues", search: { q } }); }}
              className="mt-10 flex flex-col sm:flex-row gap-2 max-w-2xl bg-white p-2 rounded-2xl shadow-glow"
            >
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by city, venue name, or vibe…"
                  className="border-0 shadow-none focus-visible:ring-0 text-foreground"
                />
              </div>
              <Button type="submit" size="lg" className="bg-primary text-primary-foreground rounded-xl">
                Explore venues <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/80">
              <Stat icon={<MapPin className="size-4 text-gold" />} v="120+" l="curated venues" />
              <Stat icon={<Calendar className="size-4 text-gold" />} v="8.5k" l="events booked" />
              <Stat icon={<Star className="size-4 text-gold" />} v="4.9" l="average rating" />
              <Stat icon={<Users className="size-4 text-gold" />} v="50k" l="happy guests" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm text-gold font-medium">Editor's picks</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1">Top-rated venues this week</h2>
          </div>
          <Link to="/venues" className="text-sm font-medium hover:underline hidden md:flex items-center gap-1">
            See all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => <VenueCard key={v.id} v={v} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-8">Plan any moment</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Weddings", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600" },
            { t: "Corporate", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600" },
            { t: "Birthdays", img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600" },
            { t: "Galas", img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600" },
          ].map((c) => (
            <Link key={c.t} to="/venues" className="relative aspect-[4/5] overflow-hidden rounded-2xl group">
              <img src={c.img} alt={c.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <p className="font-display text-2xl font-semibold">{c.t}</p>
                <p className="text-sm text-white/80">Browse →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, v, l }: { icon: React.ReactNode; v: string; l: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span><b className="text-white">{v}</b> {l}</span>
    </div>
  );
}
