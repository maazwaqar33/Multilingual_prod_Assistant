"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email address...');
    // Avoid double verification in React 18 strict mode
    const [hasRun, setHasRun] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token.');
            return;
        }

        if (hasRun) return;
        setHasRun(true);

        const verify = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_URL}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified!');
                    setTimeout(() => router.push('/'), 3000);
                } else {
                    // Start by assuming error, but check if "already verified"
                    setStatus('error');
                    setMessage(data.detail || 'Verification failed. The link may have expired.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error. Please try again later.');
            }
        };

        verify();
    }, [token, router, hasRun]);

    return (
        <div className="text-center space-y-6 animate-in fade-in duration-500">
            {status === 'verifying' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold">Verifying...</h2>
                    <p className="text-muted-foreground">{message}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-600">Verified!</h2>
                    <p className="text-muted-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                    <Link href="/" className="inline-block px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25">
                        Go to Login
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">{message}</p>
                    <Link href="/" className="inline-block px-8 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors">
                        Return to Login
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border bg-card/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
