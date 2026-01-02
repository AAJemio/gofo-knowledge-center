import { NextResponse } from 'next/server';

type ApiHandler = (req: Request, ...args: any[]) => Promise<NextResponse | Response>;

export function apiHandler(handler: ApiHandler): ApiHandler {
    return async (req: Request, ...args: any[]) => {
        try {
            return await handler(req, ...args);
        } catch (error: any) {
            console.error('API Error:', error);

            // Determine status code
            let status = 500;
            if (error.message.includes('Not found') || error.name === 'NotFoundError') {
                status = 404;
            } else if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
                status = 401;
            } else if (error.message.includes('Forbidden')) {
                status = 403;
            } else if (error.message.includes('Bad request') || error.name === 'ValidationError') {
                status = 400;
            }

            return NextResponse.json(
                {
                    error: true,
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR'
                },
                { status }
            );
        }
    };
}
