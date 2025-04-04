# Project Gutenberg Explorer

## Environment Variables Setup

For proper API functionality, ensure the following environment variable is set in your Vercel deployment:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following environment variable:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://dull-meggie-1omar-d9f030db.koyeb.app`
4. Select all environments (Production, Preview, Development)
5. Save and redeploy your application

Note: This environment variable configures where your frontend will send API requests. 