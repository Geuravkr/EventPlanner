import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { VenueCard } from "@/components/VenueCard";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({ meta: [{ title: "Saved venues — Eventide" }] }),
});

function FavoritesPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const { data: favs = [], refetch } = useQuery({
    queryKey: ["favs-full", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("favorites").select("venue_id, venues(*)").eq("user_id", user!.id)).data ?? [],
  });

  const venues = useMemo(() => favs.map((f: any) => f.venues).filter(Boolean), [favs]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="font-display text-4xl font-semibold">Saved venues</h1>
      <p className="text-muted-foreground mt-1">{venues.length} favorited</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {venues.map((v: any) => <VenueCard key={v.id} v={v} favorited onToggle={() => refetch()} />)}
        {venues.length === 0 && <p className="text-muted-foreground col-span-full">No saved venues yet.</p>}
      </div>
    </div>
  );
}
