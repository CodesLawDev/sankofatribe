# Environment Variables Setup Script

Write-Host "🔧 Setting up Analytics & SMS Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path .env.local) {
    Write-Host "✓ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "✓ Created .env.local from example" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Required Environment Variables for Analytics & SMS:" -ForegroundColor Cyan
Write-Host ""

# Check each required variable
$requiredVars = @(
    @{Name="BMS_API_KEY"; Description="BMS API Key (existing)"; Example="your_bms_api_key"},
    @{Name="BMS_SENDER_ID"; Description="SMS Sender ID"; Example="Sankofa"},
    @{Name="CRON_SECRET"; Description="Random secret for cron job (32+ chars)"; Example=""},
    @{Name="NEXT_PUBLIC_BASE_URL"; Description="Production URL"; Example="https://sankofatribe.com"}
)

Write-Host ""
Write-Host "ℹ️  Admin Phone Number:" -ForegroundColor Cyan
Write-Host "   Pulled from Sanity siteSettings.adminPhone" -ForegroundColor Gray
Write-Host ""

$content = Get-Content .env.local -Raw

foreach ($var in $requiredVars) {
    if ($content -match "$($var.Name)=(.+)") {
        $value = $matches[1].Trim()
        if ($value -and $value -notlike "*your_*" -and $value -notlike "*here*") {
            Write-Host "  ✓ $($var.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($var.Name) - NOT SET" -ForegroundColor Red
            Write-Host "    Description: $($var.Description)" -ForegroundColor Gray
            Write-Host "    Example: $($var.Example)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ $($var.Name) - MISSING" -ForegroundColor Red
        Write-Host "    Description: $($var.Description)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "  • BMS Dashboard: https://bms.codeslaw.dev" -ForegroundColor Blue
Write-Host "  • Your SMS Logs: BMS Admin Panel" -ForegroundColor Blue
Write-Host ""

# Generate random CRON_SECRET if needed
if ($content -notmatch "CRON_SECRET=(.+)" -or $content -match "CRON_SECRET=your_random") {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [System.Convert]::ToBase64String($bytes)
    Write-Host "💡 Suggested CRON_SECRET (copy this):" -ForegroundColor Yellow
    Write-Host "   $secret" -ForegroundColor White
    Write-Host ""
}

Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Add missing environment variables to .env.local" -ForegroundColor White
Write-Host "  2. Run: npx prisma generate && npx prisma db push" -ForegroundColor White
Write-Host "  3. Run: npm run dev" -ForegroundColor White
Write-Host "  4. Visit /admin to see analytics dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full documentation: ANALYTICS_SMS_SETUP.md" -ForegroundColor Gray
Write-Host ""
