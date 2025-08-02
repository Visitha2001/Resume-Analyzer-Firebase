import { FileCheck2 } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 bg-primary/10 rounded-lg">
        <FileCheck2 className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground font-headline tracking-tighter">
        ResumeRefine
      </h1>
    </div>
  );
}
