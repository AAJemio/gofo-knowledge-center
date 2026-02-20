import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0, // Disable tracing
    replaysSessionSampleRate: 0, // Disable replay
    replaysOnErrorSampleRate: 0, // Disable replay on error
    integrations: [], // Minimal integrations
});
