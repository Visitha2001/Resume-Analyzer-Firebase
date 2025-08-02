'use client';

import { useState } from 'react';
import { provideResumeFeedback, ProvideResumeFeedbackOutput } from '@/ai/flows/provide-resume-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreCircle } from '@/components/score-circle';
import { Logo } from '@/components/logo';
import { Lightbulb, Download, FileText, Briefcase, Sparkles, Wand2 } from 'lucide-react';

export default function Home() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ProvideResumeFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both your resume and the job description.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await provideResumeFeedback({
        resumeContent: resume,
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
    const element = document.createElement("a");
    const file = new Blob([resume], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "refined_resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const canAnalyze = !isLoading && !!resume.trim() && !!jobDescription.trim();

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <header className="py-4 px-4 md:px-8 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <Logo />
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Optimize Your Resume in Seconds</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Paste your resume and a job description to get AI-powered feedback, a keyword match score, and tailored suggestions for improvement.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="text-primary" />
                <span>Your Resume</span>
              </CardTitle>
              <CardDescription>Paste the full text of your resume below. You can edit it here after receiving feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your resume here..."
                className="min-h-[300px] text-sm"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                aria-label="Your Resume"
              />
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl">
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
                className="min-h-[300px] text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                aria-label="Job Description"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" onClick={handleAnalyze} disabled={isLoading || !resume.trim() || !jobDescription.trim()}>
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

      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} ResumeRefine. All rights reserved.</p>
      </footer>
    </div>
  );
}

const LoadingState = () => (
  <div className="mt-12">
    <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
    <div className="grid gap-8 md:grid-cols-3 mb-8">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
    <Skeleton className="h-64 rounded-xl" />
  </div>
);

interface ResultsDisplayProps {
  result: ProvideResumeFeedbackOutput;
  onDownload: () => void;
}

const ResultsDisplay = ({ result, onDownload }: ResultsDisplayProps) => (
  <section className="mt-12 animate-in fade-in duration-500">
    <h3 className="text-3xl font-bold text-center font-headline mb-8">Analysis Results</h3>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="text-center shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Keyword Match</CardTitle>
          <CardDescription>How well your resume keywords align with the job description.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreCircle score={result.keywordMatchScore} />
        </CardContent>
      </Card>

      <Card className="text-center shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Resume Completeness</CardTitle>
          <CardDescription>How detailed and complete your resume is for this role.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreCircle score={result.completenessScore} />
        </CardContent>
      </Card>
      
      <Card className="text-center shadow-lg rounded-xl flex flex-col justify-center items-center">
        <CardHeader>
          <CardTitle>Download Resume</CardTitle>
          <CardDescription>Edit your resume above and download the refined text file.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" size="lg" onClick={onDownload}>
            <Download className="mr-2 h-5 w-5" />
            Download .txt
          </Button>
        </CardContent>
      </Card>
    </div>

    <Card className="shadow-lg rounded-xl">
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
