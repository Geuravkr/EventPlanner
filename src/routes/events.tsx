import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/events")({
  component: EventsPage,
  head: () => ({ meta: [{ title: "My events — Eventide" }] }),
});

const TYPES = ["Wedding", "Corporate", "Birthday", "Conference", "Gala", "Other"];

function EventsPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", event_date: "", guest_count: 50, budget: 5000, event_type: "Wedding" });

  const { data: events = [], refetch } = useQuery({
    queryKey: ["events", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("events").select("*").eq("user_id", user!.id).order("event_date")).data ?? [],
  });

  const create = async () => {
    if (!form.name || !form.event_date) return toast.error("Name and date required");
    const status = new Date(form.event_date) < new Date() ? "completed" : "upcoming";
    const { error } = await supabase.from("events").insert({ ...form, user_id: user!.id, status });
    if (error) return toast.error(error.message);
    toast.success("Event created");
    setOpen(false);
    refetch();
  };

  const remove = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    refetch();
  };

  // Smart budget split
  const split = (b: number) => ({ venue: b * 0.5, catering: b * 0.3, decoration: b * 0.2 });

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">My events</h1>
          <p className="text-muted-foreground mt-1">{events.length} planned · {events.filter((e) => e.status === "upcoming").length} upcoming</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="size-4" /> New event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={form.event_date} onChange={(e) => setForm({...form, event_date: e.target.value})} /></div>
                <div><Label>Type</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm({...form, event_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Guests</Label><Input type="number" value={form.guest_count} onChange={(e) => setForm({...form, guest_count: Number(e.target.value)})} /></div>
                <div><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({...form, budget: Number(e.target.value)})} /></div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground" onClick={create}>Create event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        {events.map((e) => {
          const s = split(Number(e.budget));
          return (
            <div key={e.id} className="p-6 rounded-2xl border bg-card shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-gold font-medium">{e.event_type}</span>
                  <h3 className="font-display text-xl font-semibold mt-0.5">{e.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <CalendarDays className="size-4" /> {new Date(e.event_date).toDateString()} · {e.guest_count} guests
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(e.id)}><Trash2 className="size-4" /></Button>
              </div>
              <div className="mt-5">
                <p className="text-xs text-muted-foreground mb-2">Smart budget split (${Number(e.budget).toLocaleString()})</p>
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: "50%" }} title={`Venue $${s.venue}`} />
                  <div className="bg-gold" style={{ width: "30%" }} title={`Catering $${s.catering}`} />
                  <div className="bg-accent" style={{ width: "20%" }} title={`Decoration $${s.decoration}`} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Venue ${s.venue.toLocaleString()}</span>
                  <span>Catering ${s.catering.toLocaleString()}</span>
                  <span>Decor ${s.decoration.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full text-center py-16 border rounded-2xl bg-card">
            <p className="text-muted-foreground">No events yet — start planning your first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
