export interface Script {
  id: string;
  name: string;
  description: string;
  command: string;
  category: string;
  tags?: string[];
  params?: { key: string; desc: string }[];
}

export type Category = '全部' | 'FFmpeg' | 'Git' | 'ImageMagick' | 'Shell';
