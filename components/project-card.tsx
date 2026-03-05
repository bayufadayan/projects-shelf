'use client';

import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Trash2, Edit2, Github, Pin, PinOff } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onToggleFeatured }: ProjectCardProps) {
  return (
    <Card className={`flex flex-col gap-4 p-6 transition-all hover:shadow-lg ${project.featured ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
          <div className="flex shrink-0 flex-wrap gap-1">
            {project.typeName && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {project.typeName}
              </span>
            )}
            {project.featured && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Pinned
              </span>
            )}
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        )}
      </div>

      {project.platformNames && project.platformNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.platformNames.map((name) => (
            <span
              key={name}
              className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Live
            </Button>
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </a>
        )}
      </div>

      <div className="mt-auto flex gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleFeatured(project.id, !project.featured)}
          className="gap-2"
          title={project.featured ? 'Unpin project' : 'Pin project'}
        >
          {project.featured ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(project)}
          className="flex-1 gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(project.id)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

