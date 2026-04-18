# Test if domain is accessible
Write-Host "Testing mychatbot.website..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "https://mychatbot.website" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length) bytes" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full Error:" -ForegroundColor Yellow
    Write-Host $_.Exception -ForegroundColor Yellow
}

Write-Host "`nTesting www.mychatbot.website..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://www.mychatbot.website" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
