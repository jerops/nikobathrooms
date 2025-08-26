# User Deletion Sync: Supabase to Webflow CMS

This system automatically deletes users from Webflow CMS when they are deleted from Supabase Auth.

## Components

1. **Edge Function**: `delete-webflow-user`
2. **Database Trigger**: Automatically calls the edge function when users are deleted
3. **SQL Migration**: Sets up the database trigger

## How It Works

```
User deleted from Supabase Auth
         ↓
Database trigger activates
         ↓
Calls delete-webflow-user edge function
         ↓
Function finds user in Webflow CMS by:
  - Firebase UID (contains Supabase user_id)
  - Email address (fallback)
         ↓
Deletes user from Webflow CMS
```

## Deployment Steps

### 1. Deploy the Edge Function

```bash
# Navigate to your project directory
cd your-project

# Deploy the edge function
supabase functions deploy delete-webflow-user
```

### 2. Apply the Database Migration

```bash
# Apply the migration to create the trigger
supabase db push

# Or apply specific migration
supabase migration up --include-all
```

### 3. Set Environment Variables

Make sure your Supabase project has the `WEBFLOW_API_TOKEN` environment variable set:

```bash
supabase secrets set WEBFLOW_API_TOKEN=your_webflow_token_here
```

### 4. Verify Setup

You can test the system by:

1. Creating a test user through your signup form
2. Verifying they appear in both Supabase Auth and Webflow CMS
3. Deleting the user from Supabase Auth dashboard
4. Confirming they are automatically removed from Webflow CMS

## Manual Testing

You can also manually trigger the edge function:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/delete-webflow-user \\
  -H "Authorization: Bearer your-anon-key" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id": "user-uuid-here", "email": "user@example.com"}'
```

## Function Details

The `delete-webflow-user` edge function:
- Accepts `user_id` and/or `email` in the request body
- Searches Webflow CMS for matching users
- Deletes the found user from CMS
- Returns success/error response with details
- Handles cases where user is not found (already deleted)

## Error Handling

The system handles several scenarios:
- User not found in CMS (returns success - already deleted)
- Webflow API errors (logs error details)
- Network issues (function will retry automatically)
- Missing environment variables (returns clear error)

## Security

- Uses Supabase service key for internal trigger calls
- Webflow API token stored as encrypted secret
- Function runs with proper authentication checks
- Database trigger uses SECURITY DEFINER for permissions

## Monitoring

Check the Supabase Functions logs to monitor:
- Successful deletions
- Users not found in CMS
- API errors or failures
- Function execution times

```bash
supabase functions logs delete-webflow-user
```

## Troubleshooting

If users are not being deleted from CMS:

1. Check if the migration was applied: `supabase db diff`
2. Verify edge function is deployed: `supabase functions list`
3. Check function logs: `supabase functions logs delete-webflow-user`
4. Verify Webflow API token: `supabase secrets list`
5. Test manual function call to isolate issues