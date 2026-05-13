param(
  [string]$PostgresPassword = "postgres"
)

$ErrorActionPreference = "Stop"

$redisMsi = Join-Path $env:TEMP "Memurai-Developer-v4.1.2.msi"
$postgresExe = Join-Path $env:TEMP "postgresql-17.9-2-windows-x64.exe"

Write-Host "[scale-setup] Downloading Memurai..."
Invoke-WebRequest -Uri "https://dist.memurai.com/releases/Memurai-Developer/4.1.2/Memurai-Developer-v4.1.2.msi" -OutFile $redisMsi

Write-Host "[scale-setup] Installing Memurai..."
Start-Process msiexec.exe -ArgumentList "/i `"$redisMsi`" /qn /norestart" -Wait -NoNewWindow

Write-Host "[scale-setup] Downloading PostgreSQL 17..."
Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-17.9-2-windows-x64.exe" -OutFile $postgresExe

Write-Host "[scale-setup] Installing PostgreSQL 17..."
$postgresArgs = @(
  "--mode", "unattended",
  "--unattendedmodeui", "none",
  "--superpassword", $PostgresPassword,
  "--servicename", "postgresql-x64-17",
  "--serverport", "5432",
  "--disable-components", "stackbuilder"
)
Start-Process $postgresExe -ArgumentList $postgresArgs -Wait -NoNewWindow

Write-Host "[scale-setup] Installation commands completed."
Write-Host "[scale-setup] Next run: npm run check:scaled"
