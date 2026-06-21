$configPath = Join-Path -Path $env:USERPROFILE -ChildPath ".gemini\config\mcp_config.json"

$serverConfig = @{
    command = "node"
    args = @("c:/Users/yousuf.suhail_cloud-/Desktop/precom/kitchenBay/mcp-server/dist/index.js")
    env = @{
        DATABASE_URL = "postgresql://neondb_owner:npg_rCSIZxFfm0v5@ep-shiny-water-aosx6e79-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
}

$config = @{}
if (Test-Path $configPath) {
    $content = Get-Content -Raw -Path $configPath
    if (-not [string]::IsNullOrWhiteSpace($content)) {
        try {
            # Parse as object to manipulate
            $parsed = ConvertFrom-Json $content
            if ($parsed -ne $null) {
                # Convert PSObject to hashtable recursively
                function ConvertTo-Hashtable($obj) {
                    if ($obj -is [PSCustomObject]) {
                        $ht = @{}
                        $obj.psobject.properties | ForEach-Object {
                            $ht[$_.Name] = ConvertTo-Hashtable $_.Value
                        }
                        return $ht
                    } elseif ($obj -is [System.Object[]]) {
                        $arr = @()
                        $obj | ForEach-Object { $arr += ConvertTo-Hashtable $_ }
                        return $arr
                    } else {
                        return $obj
                    }
                }
                $config = ConvertTo-Hashtable $parsed
            }
        } catch {
            Write-Host "Could not parse existing JSON. Starting fresh."
        }
    }
}

if (-not $config.Contains("mcpServers")) {
    $config["mcpServers"] = @{}
}

$config["mcpServers"]["kitchenbay-testing-server"] = $serverConfig

$json = ConvertTo-Json $config -Depth 10
Set-Content -Path $configPath -Value $json
Write-Host "✅ Successfully updated $configPath"
Write-Host "The KitchenBay Testing Server is now registered!"
