# supabase_keepalive.ps1 - Script to ping Supabase database every Monday & Thursday
# Keep database active to prevent Supabase Free Tier from pausing after 7 days of inactivity

$SUPABASE_URL = "https://qcrozcabcfwzomctrywy.supabase.co"
$API_KEY = "sb_publishable_ptZAxlZDs4QEvvH4hK11iA_Be3_6ymx"

$headers = @{
    "apikey"        = $API_KEY
    "Authorization" = "Bearer $API_KEY"
    "Content-Type"  = "application/json"
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
Write-Host "[$timestamp] Starting Supabase keep-alive ping..."

try {
    # 1. Query tickets count
    $resTickets = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/tickets?select=id&limit=1" -Headers $headers -Method Get
    Write-Host "[$timestamp] Successfully reached tickets table (Sample ID: $($resTickets.id))"

    # 2. Query profiles count
    $resProfiles = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/profiles?select=id,role&limit=1" -Headers $headers -Method Get
    Write-Host "[$timestamp] Successfully reached profiles table (Sample Role: $($resProfiles.role))"

    # 3. Query usage count
    $resUsage = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/usage?select=id&limit=1" -Headers $headers -Method Get
    Write-Host "[$timestamp] Successfully reached usage table."

    Write-Host "[$timestamp] Supabase keep-alive completed successfully. Database is active!"
} catch {
    Write-Error "[$timestamp] Failed to ping Supabase: $_"
}
