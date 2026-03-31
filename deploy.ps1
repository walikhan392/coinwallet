$headers = @{
    "Authorization" = "Bearer d627d8be7563475d34c15ab333846e87"
    "Content-Type" = "application/json"
}

$body = @{
    service = @{
        name = "coinwallet"
        type = "web"
        repo = "https://github.com/walikhan392/coinwallet"
        branch = "master"
        buildCommand = "npm install && npm run build"
        startCommand = "node server/index.js"
        env = "node"
    }
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers -Method Post -Body $body
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $_"
    $_.Exception.Response
}