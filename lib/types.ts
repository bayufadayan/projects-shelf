export interface ProjectType {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
}

export interface ProjectPlatform {
  id: string;
  title: string;
  createdAt: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  liveUrl?: string;
  githubUrl?: string;
  tags?: string[];
  createdAt: number;
  featured: boolean;
  typeId?: string;
  typeName?: string;        // populated via JOIN
  platformIds?: string[];   // populated via join on platform_link
  platformNames?: string[]; // populated via join on platform_link
}
