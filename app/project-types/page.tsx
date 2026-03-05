'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProjectType } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const typeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});
type TypeFormData = z.infer<typeof typeSchema>;

function TypeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: ProjectType;
  onSubmit: (data: TypeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const form = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
    },
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
                <Input placeholder="e.g. Main, Learning, Utility" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What kind of projects belong here?" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : initialData ? 'Update Type' : 'Add Type'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function ProjectTypesPage() {
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ProjectType | null>(null);
  const [toDelete, setToDelete] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/project-types')
      .then((r) => r.json())
      .then(setTypes)
      .catch(console.error)
      .finally(() => setIsFetching(false));
  }, []);

  const handleAdd = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (type: ProjectType) => {
    setSelected(type);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (type: ProjectType) => {
    setToDelete(type);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: TypeFormData) => {
    setIsLoading(true);
    try {
      if (selected) {
        await fetch(`/api/project-types/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setTypes((prev) =>
          prev.map((t) => (t.id === selected.id ? { ...t, ...data } : t))
        );
      } else {
        const res = await fetch('/api/project-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const newType: ProjectType = await res.json();
        setTypes((prev) => [...prev, newType]);
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
      await fetch(`/api/project-types/${toDelete.id}`, { method: 'DELETE' });
      setTypes((prev) => prev.filter((t) => t.id !== toDelete.id));
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
            <h2 className="text-3xl font-bold text-foreground">Project Types</h2>
            <p className="mt-2 text-muted-foreground">
              Manage categories for your projects
            </p>
          </div>
          <Button onClick={handleAdd} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Type
          </Button>
        </div>

        {isFetching ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : types.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-4 text-lg font-medium text-foreground">No project types yet</p>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Type
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {types.map((type) => (
              <Card key={type.id} className="flex items-start justify-between gap-4 p-5">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">{type.title}</span>
                  {type.description && (
                    <span className="text-sm text-muted-foreground">{type.description}</span>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(type)} className="gap-1">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(type)} className="gap-1">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit Project Type' : 'New Project Type'}</DialogTitle>
          </DialogHeader>
          <TypeForm
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
