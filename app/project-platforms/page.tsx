'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProjectPlatform } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const platformSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});
type PlatformFormData = z.infer<typeof platformSchema>;

function PlatformForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: ProjectPlatform;
  onSubmit: (data: PlatformFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const form = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: { title: initialData?.title || '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Web, Mobile, Backend" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : initialData ? 'Update Platform' : 'Add Platform'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function ProjectPlatformsPage() {
  const [platforms, setPlatforms] = useState<ProjectPlatform[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ProjectPlatform | null>(null);
  const [toDelete, setToDelete] = useState<ProjectPlatform | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/project-platforms')
      .then((r) => r.json())
      .then(setPlatforms)
      .catch(console.error)
      .finally(() => setIsFetching(false));
  }, []);

  const handleFormSubmit = async (data: PlatformFormData) => {
    setIsLoading(true);
    try {
      if (selected) {
        await fetch(`/api/project-platforms/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setPlatforms((prev) =>
          prev.map((p) => (p.id === selected.id ? { ...p, ...data } : p))
        );
      } else {
        const res = await fetch('/api/project-platforms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const newPlatform: ProjectPlatform = await res.json();
        setPlatforms((prev) => [...prev, newPlatform].sort((a, b) => a.title.localeCompare(b.title)));
      }
      setIsFormOpen(false);
      setSelected(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setIsLoading(true);
    try {
      await fetch(`/api/project-platforms/${toDelete.id}`, { method: 'DELETE' });
      setPlatforms((prev) => prev.filter((p) => p.id !== toDelete.id));
      setIsDeleteOpen(false);
      setToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Project Platforms</h2>
            <p className="mt-2 text-muted-foreground">
              Manage platforms for your projects
            </p>
          </div>
          <Button onClick={() => { setSelected(null); setIsFormOpen(true); }} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Platform
          </Button>
        </div>

        {isFetching ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : platforms.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-4 text-lg font-medium text-foreground">No platforms yet</p>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Platform
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <Card key={platform.id} className="flex items-center gap-3 px-4 py-3">
                <span className="font-medium text-foreground">{platform.title}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => { setSelected(platform); setIsFormOpen(true); }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => { setToDelete(platform); setIsDeleteOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit Platform' : 'New Platform'}</DialogTitle>
          </DialogHeader>
          <PlatformForm
            initialData={selected || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormOpen(false); setSelected(null); }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        projectTitle={toDelete?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteOpen(false); setToDelete(null); }}
        isLoading={isLoading}
      />
    </main>
  );
}
