'use server';

/**
 * @fileOverview Analyzes a resume against a job description to calculate a keyword match score and determine resume completeness.
 *
 * - analyzeResumeMatch - A function that analyzes the resume and job description.
 * - AnalyzeResumeMatchInput - The input type for the analyzeResumeMatch function.
 * - AnalyzeResumeMatchOutput - The return type for the analyzeResumeMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeMatchInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume.'),
  jobDescriptionText: z
    .string()
    .describe('The text content of the job description.'),
});
export type AnalyzeResumeMatchInput = z.infer<typeof AnalyzeResumeMatchInputSchema>;

const AnalyzeResumeMatchOutputSchema = z.object({
  keywordMatchScore: z
    .number()
    .describe('A score (0-100) representing the keyword match between the resume and job description.'),
  completenessAssessment: z
    .string()
    .describe('An assessment of how complete and detailed the resume is, based on the job description.'),
});
export type AnalyzeResumeMatchOutput = z.infer<typeof AnalyzeResumeMatchOutputSchema>;

export async function analyzeResumeMatch(input: AnalyzeResumeMatchInput): Promise<AnalyzeResumeMatchOutput> {
  return analyzeResumeMatchFlow(input);
}

const analyzeResumeMatchPrompt = ai.definePrompt({
  name: 'analyzeResumeMatchPrompt',
  input: {schema: AnalyzeResumeMatchInputSchema},
  output: {schema: AnalyzeResumeMatchOutputSchema},
  prompt: `You are a professional resume analyst. Analyze the provided resume and job description to determine the keyword match score (0-100) and assess the resume's completeness.

Resume:
{{resumeText}}

Job Description:
{{jobDescriptionText}}

Provide the keywordMatchScore and completenessAssessment based on your analysis.

Please make the completenessAssessment be one to two sentences.`,
});

const analyzeResumeMatchFlow = ai.defineFlow(
  {
    name: 'analyzeResumeMatchFlow',
    inputSchema: AnalyzeResumeMatchInputSchema,
    outputSchema: AnalyzeResumeMatchOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumeMatchPrompt(input);
    return output!;
  }
);
