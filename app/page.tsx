'use client';

import { useEffect, useState } from 'react';
import { Project, ProjectType, ProjectPlatform } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { ProjectCard } from '@/components/project-card';
import { ProjectForm } from '@/components/project-form';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { ProjectSidebar, FilterValue } from '@/components/project-sidebar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus, SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [projectPlatforms, setProjectPlatforms] = useState<ProjectPlatform[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load projects and project types from database on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/project-types').then((r) => r.json()),
      fetch('/api/project-platforms').then((r) => r.json()),
    ])
      .then(([projectsData, typesData, platformsData]) => {
        setProjects(projectsData);
        setProjectTypes(typesData);
        setProjectPlatforms(platformsData);
      })
      .catch((error) => console.error('Failed to load data:', error))
      .finally(() => setIsFetching(false));
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<Project, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
  ) => {
    setIsLoading(true);
    try {
      if (data.id) {
        // Update existing project
        await fetch(`/api/projects/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setProjects((prev) =>
          prev.map((p) =>
            p.id === data.id
              ? {
                  ...p,
                  ...data,
                  id: data.id!,
                  createdAt: data.createdAt || p.createdAt,
                  typeName: projectTypes.find((t) => t.id === data.typeId)?.title,
                  platformNames: data.platformIds
                    ?.map((id) => projectPlatforms.find((pl) => pl.id === id)?.title)
                    .filter(Boolean) as string[] | undefined,
                }
              : p
          )
        );
      } else {
        // Add new project
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const newProject: Project = await res.json();
        // Enrich with typeName from local state
        const enriched: Project = {
          ...newProject,
          typeName: projectTypes.find((t) => t.id === newProject.typeId)?.title,
          platformNames: newProject.platformIds
            ?.map((id) => projectPlatforms.find((pl) => pl.id === id)?.title)
            .filter(Boolean) as string[] | undefined,
        };
        setProjects((prev) => [enriched, ...prev]);
      }
      setIsFormOpen(false);
      setSelectedProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setProjectToDelete(id);
      setSelectedProject(project);
      setIsDeleteModalOpen(true);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured } : p))
    );
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      // Revert on error
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p))
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsLoading(true);
    try {
      await fetch(`/api/projects/${projectToDelete}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setSelectedProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto flex max-w-7xl gap-0 px-4 sm:px-6 lg:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-0 py-12 pr-6">
            <ProjectSidebar
              projectTypes={projectTypes}
              projects={projects}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Your Projects</h2>
              <p className="mt-2 text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? 's' : ''} in your collection
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile sidebar trigger */}
              <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-6">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filter</SheetTitle>
                  </SheetHeader>
                  <ProjectSidebar
                    projectTypes={projectTypes}
                    projectPlatforms={projectPlatforms}
                    projects={projects}
                    activeFilter={activeFilter}
                    onFilterChange={(v) => {
                      setActiveFilter(v);
                      setIsMobileSidebarOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>

              <Button onClick={handleAddProject} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                New Project
              </Button>
            </div>
          </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-4 text-lg font-medium text-foreground">No projects yet</p>
            <p className="mb-6 text-muted-foreground">
              Create your first project to get started. Showcase your work and share your accomplishments.
            </p>
            <Button onClick={handleAddProject} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          (() => {
            // Apply filter
            const filtered = projects.filter((p) => {
              if (activeFilter === 'all') return true;
              if (activeFilter === 'featured') return p.featured;
              if (activeFilter.startsWith('type:')) return p.typeId === activeFilter.slice(5);
              if (activeFilter.startsWith('platform:')) return p.platformIds?.includes(activeFilter.slice(9));
              return true;
            });

            const sorted = [...filtered].sort((a, b) =>
              a.title.localeCompare(b.title)
            );
            const pinned = sorted.filter((p) => p.featured);
            const rest = sorted.filter((p) => !p.featured);

            if (filtered.length === 0) {
              return (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                  <p className="text-muted-foreground">No projects match this filter.</p>
                </div>
              );
            }

            return (
              <div className="space-y-8">
                {pinned.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-sm font-medium text-primary">Pinned</span>
                      <div className="h-px flex-1 bg-primary/20" />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {pinned.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onEdit={handleEditProject}
                          onDelete={handleDeleteClick}
                          onToggleFeatured={handleToggleFeatured}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {pinned.length > 0 && rest.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">All Projects</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                {rest.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {rest.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteClick}
                        onToggleFeatured={handleToggleFeatured}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'New Project'}</DialogTitle>
            {selectedProject && (
              <DialogDescription>Update the details of your project</DialogDescription>
            )}
          </DialogHeader>
          <ProjectForm
            initialData={selectedProject || undefined}
            projectTypes={projectTypes}
            projectPlatforms={projectPlatforms}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedProject(null);
            }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        projectTitle={selectedProject?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
          setSelectedProject(null);
        }}
        isLoading={isLoading}
      />
    </main>
  );
}
