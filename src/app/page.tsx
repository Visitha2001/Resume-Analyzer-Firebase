'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { provideResumeFeedback, ProvideResumeFeedbackOutput } from '@/ai/flows/provide-resume-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreCircle } from '@/components/score-circle';
import { Logo } from '@/components/logo';
import { Lightbulb, Download, FileText, Briefcase, Sparkles, Wand2, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ProvideResumeFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (PNG, JPG).',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setResumeDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (PNG, JPG).',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setResumeDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeDataUri || !jobDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please upload your resume and provide the job description.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await provideResumeFeedback({
        resumeDataUri: resumeDataUri,
        jobDescription: jobDescription,
      });
      setResult(response);
      toast({
        title: 'Analysis Complete!',
        description: "Your resume feedback is ready.",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    const element = document.createElement("a");
    const file = new Blob([`Original resume analyzed. Feedback:\n\n${result.feedback}`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "refined_resume_feedback.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  const canAnalyze = !isLoading && !!resumeDataUri && !!jobDescription.trim();

  return (
    <div className="flex flex-col min-h-dvh text-foreground font-body bg-[linear-gradient(45deg,hsl(var(--background)),hsl(var(--primary)/0.2),hsl(var(--accent)/0.2),hsl(var(--background)))] bg-[length:400%_400%] animate-[gradient-animation_15s_ease_infinite]">
      <header className="py-4 px-4 md:px-8 border-b border-border/20 bg-background/30 backdrop-blur-sm sticky top-0 z-10">
        <Logo />
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-gradient-animation">Optimize Your Resume in Seconds</h2>
          <p className="mt-4 text-lg text-muted-foreground/90 max-w-3xl mx-auto">
            Upload an image of your resume and paste a job description to get AI-powered feedback, a keyword match score, and tailored suggestions.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg rounded-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="text-primary" />
                <span>Your Resume</span>
              </CardTitle>
              <CardDescription>Upload an image of your resume (JPG, PNG). Max 4MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
              />
              {resumeDataUri ? (
                 <div className="relative">
                   <Image src={resumeDataUri} alt="Resume preview" width={500} height={700} className="rounded-md border" />
                   <Button
                     variant="destructive"
                     size="icon"
                     className="absolute top-2 right-2 rounded-full h-8 w-8"
                     onClick={() => setResumeDataUri(null)}
                   >
                     <X className="h-4 w-4" />
                   </Button>
                 </div>
              ) : (
                <div
                  className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-muted/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-foreground">Drag & drop your resume image here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Briefcase className="text-primary" />
                <span>Job Description</span>
              </CardTitle>
              <CardDescription>Paste the job description you're applying for to get a tailored analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[300px] text-sm bg-background/80"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                aria-label="Job Description"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" onClick={handleAnalyze} disabled={!canAnalyze}>
            {isLoading ? (
              <>
                <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {isLoading && <LoadingState />}
        {result && !isLoading && <ResultsDisplay result={result} onDownload={handleDownload} />}
      </main>

      <footer className="text-center py-6 text-sm text-muted-foreground/80 border-t border-border/20">
        <p>&copy; {new Date().getFullYear()} ResumeRefine. All rights reserved.</p>
      </footer>
    </div>
  );
}

const LoadingState = () => (
  <div className="mt-12">
    <Skeleton className="h-8 w-1/3 mx-auto mb-8 bg-muted/50" />
    <div className="grid gap-8 md:grid-cols-3 mb-8">
      <Skeleton className="h-48 rounded-xl bg-muted/50" />
      <Skeleton className="h-48 rounded-xl bg-muted/50" />
      <Skeleton className="h-48 rounded-xl bg-muted/50" />
    </div>
    <Skeleton className="h-64 rounded-xl bg-muted/50" />
  </div>
);

interface ResultsDisplayProps {
  result: ProvideResumeFeedbackOutput;
  onDownload: () => void;
}

const ResultsDisplay = ({ result, onDownload }: ResultsDisplayProps) => (
  <section className="mt-12 animate-in fade-in duration-500">
    <h3 className="text-3xl font-bold text-center font-headline mb-8 text-primary-foreground/90">Analysis Results</h3>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="text-center shadow-lg rounded-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Keyword Match</CardTitle>
          <CardDescription>How well your resume keywords align with the job description.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreCircle score={result.keywordMatchScore} />
        </CardContent>
      </Card>

      <Card className="text-center shadow-lg rounded-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Resume Completeness</CardTitle>
          <CardDescription>How detailed and complete your resume is for this role.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreCircle score={result.completenessScore} />
        </CardContent>
      </Card>
      
      <Card className="text-center shadow-lg rounded-xl flex flex-col justify-center items-center bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Download Feedback</CardTitle>
          <CardDescription>Download the AI-generated feedback as a text file.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" size="lg" onClick={onDownload}>
            <Download className="mr-2 h-5 w-5" />
            Download .txt
          </Button>
        </CardContent>
      </Card>
    </div>

    <Card className="shadow-lg rounded-xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Lightbulb className="text-primary" />
          <span>AI-Powered Feedback</span>
        </CardTitle>
        <CardDescription>Actionable suggestions to improve your resume for this specific job.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
          {result.feedback}
        </div>
      </CardContent>
    </Card>
  </section>
);
