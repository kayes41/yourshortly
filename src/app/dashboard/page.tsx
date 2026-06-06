"use client";

import { useState, useEffect, useCallback } from "react";
import { Link as LinkIcon, Copy, Edit2, Trash2, BarChart2, Search, ExternalLink, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0, page: 1, limit: 10 });

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (res.ok) {
        setLinks(data.links);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load links");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, customAlias }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Short link created successfully!");
        setTargetUrl("");
        setCustomAlias("");
        fetchLinks();
      } else {
        toast.error(data.error || "Failed to create link");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard!");
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link);
    setEditTargetUrl(link.targetUrl);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingLink) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/links/${editingLink.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: editTargetUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Link updated successfully");
        setEditOpen(false);
        fetchLinks();
      } else {
        toast.error(data.error || "Failed to update link");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this link? All analytics will be lost.")) return;

    try {
      const res = await fetch(`/api/links/${slug}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Link deleted");
        fetchLinks();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete link");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <>
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create Short Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="targetUrl">Destination URL</Label>
              <Input
                id="targetUrl"
                placeholder="https://example.com/very/long/url..."
                className="bg-background border-border h-11"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
              />
            </div>
            <div className="w-full md:w-64 space-y-2">
              <Label htmlFor="customAlias">Custom Alias <span className="text-muted-foreground text-xs">(Optional)</span></Label>
              <Input
                id="customAlias"
                placeholder="e.g. my-campaign"
                className="bg-background border-border h-11"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={creating}
              className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Shorten"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-xl overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            Your Links ({pagination.total})
          </h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              className="pl-9 bg-background border-border h-9 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-[300px]">Short Link</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="w-[100px] text-center">Clicks</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading links...
                  </TableCell>
                </TableRow>
              ) : links.length === 0 ? (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No links found. Create your first short link above!
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link._id} className="border-slate-800 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <a 
                          href={`/${link.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 max-w-[200px] truncate"
                        >
                          yourshortly.xyz/{link.slug}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="max-w-[300px] truncate" title={link.targetUrl}>
                        {link.targetUrl}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-800 text-sm font-medium text-foreground">
                        {link.clicks.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(link.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary-foreground" onClick={() => copyToClipboard(link.slug)} title="Copy">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary-foreground" onClick={() => window.location.href = `/dashboard/stats/${link.slug}`} title="Stats">
                          <BarChart2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary-foreground" onClick={() => openEditDialog(link)} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(link.slug)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-border hover:bg-muted text-foreground"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-transparent border-border hover:bg-muted text-foreground"
                disabled={page === pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Link Destination</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Change where <span className="font-semibold text-foreground">yourshortly.xyz/{editingLink?.slug}</span> redirects to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTargetUrl">New Destination URL</Label>
              <Input
                id="editTargetUrl"
                value={editTargetUrl}
                onChange={(e) => setEditTargetUrl(e.target.value)}
                className="bg-background border-border focus-visible:ring-blue-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent border-border hover:bg-muted text-foreground" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={savingEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {savingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
