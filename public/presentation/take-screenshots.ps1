$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\cw11\mystyleKPOP\presentation\screenshots"
$base = "http://localhost:3000"

$pages = @(
    @{ name = "01-landing";   path = "/" },
    @{ name = "02-onboarding"; path = "/onboarding" },
    @{ name = "03-studio";    path = "/studio" },
    @{ name = "04-stylist";   path = "/studio" },
    @{ name = "05-gallery";   path = "/gallery" },
    @{ name = "06-detail";    path = "/design/sample" },
    @{ name = "07-ranking";   path = "/gallery?tab=ranking" },
    @{ name = "08-mypage";    path = "/mypage" }
)

foreach ($p in $pages) {
    $url = "$base$($p.path)"
    $file = "$outDir\$($p.name).png"
    Write-Host "Capturing $url -> $($p.name).png"
    & $chrome --headless --disable-gpu --screenshot="$file" --window-size=390,844 --force-device-scale-factor=2 --hide-scrollbars "$url" 2>$null
    Start-Sleep -Seconds 3
}

Write-Host "Done! Screenshots saved to $outDir"
