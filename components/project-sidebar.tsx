'use client';

import { Project, ProjectType, ProjectPlatform } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LayoutGrid, Pin, Tag, Monitor } from 'lucide-react';

export type FilterValue = 'all' | 'featured' | `type:${string}` | `platform:${string}`;

interface ProjectSidebarProps {
  projectTypes: ProjectType[];
  projectPlatforms: ProjectPlatform[];
  projects: Project[];
  activeFilter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  className?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, count, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
          active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function ProjectSidebar({
  projectTypes = [],
  projectPlatforms = [],
  projects = [],
  activeFilter,
  onFilterChange,
  className,
}: ProjectSidebarProps) {
  const allCount = projects.length;
  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Status
      </p>

      <NavItem
        icon={<LayoutGrid className="h-4 w-4" />}
        label="All Projects"
        count={allCount}
        active={activeFilter === 'all'}
        onClick={() => onFilterChange('all')}
      />
      <NavItem
        icon={<Pin className="h-4 w-4" />}
        label="Pinned"
        count={featuredCount}
        active={activeFilter === 'featured'}
        onClick={() => onFilterChange('featured')}
      />

      {projectTypes.length > 0 && (
        <>
          <div className="my-2 h-px bg-border" />
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            By Type
          </p>
          {projectTypes.map((type) => (
            <NavItem
              key={type.id}
              icon={<Tag className="h-4 w-4" />}
              label={type.title}
              count={projects.filter((p) => p.typeId === type.id).length}
              active={activeFilter === `type:${type.id}`}
              onClick={() => onFilterChange(`type:${type.id}`)}
            />
          ))}
        </>
      )}

      {projectPlatforms.length > 0 && (
        <>
          <div className="my-2 h-px bg-border" />
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            By Platform
          </p>
          {projectPlatforms.map((platform) => (
            <NavItem
              key={platform.id}
              icon={<Monitor className="h-4 w-4" />}
              label={platform.title}
              count={projects.filter((p) => p.platformIds?.includes(platform.id)).length}
              active={activeFilter === `platform:${platform.id}`}
              onClick={() => onFilterChange(`platform:${platform.id}`)}
            />
          ))}
        </>
      )}
    </nav>
  );
}
