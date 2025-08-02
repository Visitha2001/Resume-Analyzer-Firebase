// src/ai/flows/provide-resume-feedback.ts
'use server';

/**
 * @fileOverview Provides actionable feedback and suggestions for resume improvement based on a job description and resume content.
 *
 * - provideResumeFeedback - A function that generates feedback for resume improvement.
 * - ProvideResumeFeedbackInput - The input type for the provideResumefeedback function.
 * - ProvideResumeFeedbackOutput - The return type for the provideResumefeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideResumeFeedbackInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A PDF or image of the resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z
    .string()
    .describe('The job description for which the resume will be tailored.'),
});
export type ProvideResumeFeedbackInput = z.infer<
  typeof ProvideResumeFeedbackInputSchema
>;

const ProvideResumeFeedbackOutputSchema = z.object({
  keywordMatchScore: z
    .number()
    .describe(
      'A numerical score indicating the keyword match between the resume and job description.'
    ),
  completenessScore: z
    .number()
    .describe('A numerical score indicating how complete and detailed the resume is.'),
  feedback: z
    .string()
    .describe(
      'Actionable feedback and suggestions for improving the resume based on the job description.'
    ),
});
export type ProvideResumeFeedbackOutput = z.infer<
  typeof ProvideResumeFeedbackOutputSchema
>;

export async function provideResumeFeedback(
  input: ProvideResumeFeedbackInput
): Promise<ProvideResumeFeedbackOutput> {
  return provideResumeFeedbackFlow(input);
}

const provideResumeFeedbackPrompt = ai.definePrompt({
  name: 'provideResumeFeedbackPrompt',
  input: {schema: ProvideResumeFeedbackInputSchema},
  output: {schema: ProvideResumeFeedbackOutputSchema},
  prompt: `You are a professional resume expert providing feedback to job seekers.

  Analyze the following resume (provided as a PDF or image) against the provided job description to determine a keyword match score (0-100), how complete the resume is (0-100), and generate actionable feedback for improvement.

  Resume:
  {{media url=resumeDataUri}}

  Job Description:
  {{{jobDescription}}}

  Provide the keywordMatchScore, completenessScore and feedback in your response.
  Be specific and provide concrete examples.
  Focus on tailoring the resume to the job description effectively.
`,
});

const provideResumeFeedbackFlow = ai.defineFlow(
  {
    name: 'provideResumeFeedbackFlow',
    inputSchema: ProvideResumeFeedbackInputSchema,
    outputSchema: ProvideResumeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await provideResumeFeedbackPrompt(input);
    return output!;
  }
);
