
import { NextRequest, NextResponse } from 'next/server';
const PDFParser = require("pdf2json");
import mammoth from 'mammoth';

// Standard keywords to look for (extensible list)
const COMMON_KEYWORDS = {
    soft: [
        'communication', 'leadership', 'teamwork', 'problem solving', 'adaptability',
        'creativity', 'work ethic', 'time management', 'critical thinking', 'collaboration',
        'interpersonal', 'flexibility', 'attention to detail', 'motivation', 'integrity'
    ],
    tech: [
        'python', 'javascript', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes',
        'java', 'c++', 'html', 'css', 'git', 'agile', 'scrum', 'machine learning',
        'data analysis', 'api', 'rest', 'graphql', 'typescript', 'next.js', 'vue', 'angular',
        'mongodb', 'postgresql', 'express', 'flask', 'django', 'spring', 'hibernate',
        'redis', 'elasticsearch', 'kafka', 'spark', 'hadoop', 'pandas', 'numpy',
        'tensorflow', 'pytorch', 'jenkins', 'gitlab', 'circleci', 'terraform', 'ansible'
    ],
    sections: [
        'experience', 'work history', 'professional experience', 'employment history',
        'education', 'academic background', 'qualifications',
        'skills', 'technical skills', 'core competencies', 'technologies',
        'projects', 'key projects', 'academic projects',
        'summary', 'professional summary', 'profile', 'about me',
        'objective', 'career objective',
        'contact', 'contact information', 'personal details',
        'certifications', 'awards', 'achievements', 'languages', 'interests'
    ]
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Forward the request to the Python Service
        try {
            // Use environment variable for production, fallback to localhost for dev
            const pythonServiceUrl = process.env.ATS_API_URL || 'http://127.0.0.1:5000/score';

            const response = await fetch(pythonServiceUrl, {
                method: 'POST',
                body: formData,
                // fetch automatically sets the correct Content-Type for FormData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Python service error: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // Transform Python response to match Frontend expectations if needed, 
            // or we will update Frontend to match this new structure.
            // Python returns: { total_score, breakdown, missing_keywords }

            // Let's map it to a structure the frontend can use easily, 
            // ensuring we keep the rich data.
            return NextResponse.json({
                success: true,
                ...data
            });

        } catch (fetchError: any) {
            console.error('Failed to connect to ATS Python Service:', fetchError);
            return NextResponse.json({
                error: 'ATS Service unavailable. Please ensure the backend is running.',
                details: fetchError.message
            }, { status: 503 });
        }

    } catch (error: any) {
        console.error('SERVER ERROR processing file:', error);
        return NextResponse.json({ error: error.message || 'Failed to analyze resume' }, { status: 500 });
    }
}
