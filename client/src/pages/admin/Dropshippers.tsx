import { useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";

interface DropshipperApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  storeUrl?: string;
  platform: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

async function fetchApplications(): Promise<DropshipperApplication[]> {
  const q = query(collection(db, "dropshipper_applications"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DropshipperApplication));
}

export default function AdminDropshippers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: applications = [], isLoading } = useQuery<DropshipperApplication[]>({
    queryKey: ["/admin/dropshippers"],
    queryFn: fetchApplications,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateDoc(doc(db, "dropshipper_applications", id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/dropshippers"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const filtered =
    filterStatus === "all"
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dropshipper Applications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage applications from people who want to dropship PakCart products.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.all, color: "bg-blue-50 text-blue-700 border-blue-100", icon: Users },
          { label: "Pending", value: counts.pending, color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: Clock },
          { label: "Approved", value: counts.approved, color: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle2 },
          { label: "Rejected", value: counts.rejected, color: "bg-red-50 text-red-700 border-red-100", icon: XCircle },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{s.label}</span>
              <s.icon className="h-4 w-4 opacity-70" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({counts.all})</SelectItem>
            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
            <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
            <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">No applications found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Store Link</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => {
                const cfg = statusConfig[app.status] ?? statusConfig.pending;
                return (
                  <TableRow key={app.id} data-testid={`row-dropshipper-${app.id}`}>
                    <TableCell className="font-medium">{app.fullName}</TableCell>
                    <TableCell>
                      <div className="text-sm">{app.email}</div>
                      <div className="text-xs text-muted-foreground">{app.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">{app.platform}</TableCell>
                    <TableCell>
                      {app.storeUrl ? (
                        <a
                          href={app.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate max-w-[120px] block"
                        >
                          {app.storeUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {app.message || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="capitalize">
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {app.createdAt?.toDate
                        ? app.createdAt.toDate().toLocaleDateString("en-PK")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {app.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => updateStatus.mutate({ id: app.id, status: "approved" })}
                            disabled={updateStatus.isPending}
                            data-testid={`button-approve-${app.id}`}
                          >
                            Approve
                          </Button>
                        )}
                        {app.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateStatus.mutate({ id: app.id, status: "rejected" })}
                            disabled={updateStatus.isPending}
                            data-testid={`button-reject-${app.id}`}
                          >
                            Reject
                          </Button>
                        )}
                        {app.status !== "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-muted-foreground"
                            onClick={() => updateStatus.mutate({ id: app.id, status: "pending" })}
                            disabled={updateStatus.isPending}
                            data-testid={`button-reset-${app.id}`}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
