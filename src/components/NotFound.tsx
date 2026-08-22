import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center bg-background px-4"
      data-testid="not-found"
    >
      <div className="text-center">
        <Compass className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">This page could not be found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>
    </div>
  );
}
