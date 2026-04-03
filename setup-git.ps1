$env:PATH = 'C:\Program Files\nodejs;C:\Program Files\Git\bin;' + $env:PATH
Set-Location 'c:\Antigravity Projects\Personal\QuickLaunch'
git init
git add .
git commit -m "Initial commit: QuickLauncher v1.0.0"
git branch -M main
git remote add origin https://github.com/Gemanoneko/quicklauncher.git
Write-Host "Done. Run: git push -u origin main"
