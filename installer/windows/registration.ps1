param(
    [Parameter(Mandatory)][ValidateSet('validate','install','uninstall','rollback')][string]$Action,
    [Parameter(Mandatory)][string]$PluginDir,
    [string]$PayloadDir
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$hostIndex = Join-Path (Split-Path -Parent $PluginDir) '_index.json'
$moduleIndex = Join-Path $PluginDir '_index.json'
$marker = Join-Path $PluginDir '_pulvis-library-registration-before-install'
$inventory = Join-Path $PluginDir '_pulvis-installed-sha256.json'
$moduleIds = @('GrainFreeze','GrainSample','GrainOsc')
$owned = @('_meta.json','README.md','README.zh-CN.md','README.ru.md','LICENSE','assets/pulvis-icon.png', 'assets/pulvis-header-en.png','assets/pulvis-social-preview.png','assets/pulvis-header-zh-CN.png','assets/pulvis-header-ru.png','examples/pulvis-demo.json')
foreach ($id in $moduleIds) { $owned += @("modules/$id.js", "modules/$id.txt") }
function Read-Index($Path, $Property) {
    $obj = ConvertFrom-Json -InputObject ([IO.File]::ReadAllText($Path))
    if ($obj.$Property -isnot [array]) { throw "Invalid $Property list in $Path" }
    return $obj
}
function Write-Atomic($Path, $Bytes) {
    $temp = "$Path.$([guid]::NewGuid()).tmp"
    try {
        [IO.File]::WriteAllBytes($temp, $Bytes)
        if ([IO.File]::Exists($Path)) {
            [IO.File]::Replace($temp, $Path, [System.Management.Automation.Language.NullString]::Value)
        } else { [IO.File]::Move($temp, $Path) }
    } finally { if ([IO.File]::Exists($temp)) { [IO.File]::Delete($temp) } }
}
$journal = if ($PayloadDir) { Join-Path $PayloadDir 'pulvis-undo.xml' }
function Restore-Files($Changes) {
    foreach ($entry in $Changes.Files.GetEnumerator()) {
        if ($null -eq $entry.Value) { [IO.File]::Delete($entry.Key) }
        else { Write-Atomic $entry.Key ([byte[]]$entry.Value) }
    }
    foreach ($dir in @($Changes.Directories | Sort-Object Length -Descending)) {
        if ([IO.Directory]::Exists($dir) -and ![IO.Directory]::GetFileSystemEntries($dir).Length) { [IO.Directory]::Delete($dir) }
    }
}
if ($Action -eq 'rollback') {
    if ([IO.File]::Exists($journal)) { Restore-Files (Import-Clixml -LiteralPath $journal) }
    return
}
$index = Read-Index $hostIndex 'libraries'
if (@($index.libraries | Where-Object { $_ -isnot [string] }).Count) { throw 'Invalid library ID' }
$modules = if ([IO.File]::Exists($moduleIndex)) { Read-Index $moduleIndex 'modules' } else { [pscustomobject]@{modules=@()} }
if ($Action -eq 'validate') {
    $handle = [IO.File]::Open($hostIndex, 'Open', 'ReadWrite', 'None')
    $handle.Dispose()
    return
}
$others = @($modules.modules | Where-Object {
    $name = if ($_ -is [string]) { $_ } else { $_.name }
    $moduleIds -cnotcontains $name
})
$hasMarker = [IO.File]::Exists($marker)
$legacyDir = Join-Path (Split-Path -Parent $PluginDir) 'granular'
$prior = if ($hasMarker) { [IO.File]::ReadAllText($marker).Trim() }
    elseif ($index.libraries -ccontains 'pulvis') { 'pulvis' }
    elseif (($index.libraries -ccontains 'granular') -and ![IO.Directory]::Exists($legacyDir)) { 'granular' }
    else { 'none' }
if ($prior -cnotin @('none','granular','pulvis')) { throw 'Invalid Pulvis registration record' }
if ($Action -eq 'install') {
    $manifestPath = Join-Path $PayloadDir '_manifest.sha256.json'
    if ([IO.File]::Exists($manifestPath)) {
        $manifest = ConvertFrom-Json -InputObject ([IO.File]::ReadAllText($manifestPath))
        $sha = [Security.Cryptography.SHA256]::Create()
        try {
            foreach ($prop in $manifest.files.PSObject.Properties) {
                $leaf = [IO.Path]::GetFileName($prop.Name)
                $candidate = Join-Path $PayloadDir $leaf
                if ([IO.File]::Exists($candidate)) {
                    $actual = [BitConverter]::ToString($sha.ComputeHash([IO.File]::ReadAllBytes($candidate))).Replace('-', '').ToLowerInvariant()
                    if ($actual -cne $prop.Value) {
                        throw "Integrity check failed: $($prop.Name) has been modified. Installation aborted."
                    }
                }
            }
        } finally { $sha.Dispose() }
    }
    $payload = Read-Index (Join-Path $PayloadDir '_index.json') 'modules'
    $modules.modules = $others + $payload.modules
    if ($prior -ceq 'granular') {
        $index.libraries = @($index.libraries | ForEach-Object { if ($_ -ceq 'granular') { 'pulvis' } else { $_ } })
    }
    if ($index.libraries -cnotcontains 'pulvis') { $index.libraries += 'pulvis' }
} else {
    if (!$hasMarker) { throw 'Missing Pulvis registration record' }
    $modules.modules = $others
    if ($prior -ceq 'granular' -and $others.Count -gt 0) {
        $index.libraries = @($index.libraries | ForEach-Object { if ($_ -ceq 'pulvis') { 'granular' } else { $_ } })
    } elseif (!$others.Count) {
        $index.libraries = @($index.libraries | Where-Object { $_ -cne 'pulvis' })
    }
}
# Restore the earlier files if a later write fails. Each individual replacement is atomic.
$before = [ordered]@{}
$createdDirs = New-Object 'System.Collections.Generic.List[string]'
$changes = @{Files=$before; Directories=$createdDirs}
function Ensure-Directory($Dir) {
    if ([IO.Directory]::Exists($Dir)) { return }
    Ensure-Directory ([IO.Path]::GetDirectoryName($Dir))
    [void][IO.Directory]::CreateDirectory($Dir)
    $createdDirs.Add($Dir)
}
$core = Join-Path (Split-Path -Parent (Split-Path -Parent $PluginDir)) 'csound/modules/GrainCore.txt'
$hostDemo = Join-Path (Split-Path -Parent (Split-Path -Parent $PluginDir)) 'patches/pulvis-demo.json'
try {
    if ($Action -eq 'install') {
        foreach ($name in ($owned + 'GrainCore.txt' + 'patches/pulvis-demo.json')) {
            $file = if ($name -eq 'GrainCore.txt') { $core } elseif ($name -eq 'patches/pulvis-demo.json') { $hostDemo } else { Join-Path $PluginDir $name }
            $content = [IO.File]::ReadAllBytes((Join-Path $PayloadDir ([IO.Path]::GetFileName($name))))
            Ensure-Directory ([IO.Path]::GetDirectoryName($file))
            $old = if ([IO.File]::Exists($file)) { ,([IO.File]::ReadAllBytes($file)) }
            Write-Atomic $file $content
            $before[$file] = $old
        }
    }
    foreach ($path in @($moduleIndex,$marker,$inventory,$hostIndex)) {
        $bytes = if ($path -eq $moduleIndex) {
            if ($modules.modules.Count) { $utf8.GetBytes((ConvertTo-Json $modules -Depth 100)) }
        } elseif ($path -eq $marker) {
            if ($hasMarker -or $Action -eq 'uninstall') { continue }
            $utf8.GetBytes($prior)
        } elseif ($path -eq $inventory) {
            if ($Action -eq 'install') {
                $hashes = [ordered]@{}
                foreach ($name in $owned) {
                    $hashes[$name] = (Get-FileHash -LiteralPath (Join-Path $PluginDir $name) -Algorithm SHA256).Hash
                }
                $utf8.GetBytes((ConvertTo-Json $hashes))
            } else {
                $hashes = ConvertFrom-Json -InputObject ([IO.File]::ReadAllText($inventory))
                foreach ($name in $owned) {
                    $file = Join-Path $PluginDir $name
                    if ($name -eq '_meta.json' -and $others.Count) { continue }
                    if ([IO.File]::Exists($file) -and (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -eq $hashes.$name) {
                        $original = [IO.File]::ReadAllBytes($file)
                        [IO.File]::Delete($file)
                        $before[$file] = $original
                    }
                }
            }
        } else { $utf8.GetBytes((ConvertTo-Json $index -Depth 100)) }
        $old = if ([IO.File]::Exists($path)) { ,([IO.File]::ReadAllBytes($path)) }
        if ($null -eq $bytes) { [IO.File]::Delete($path) } else { Write-Atomic $path $bytes }
        $before[$path] = $old
    }
    if ($Action -eq 'install') { Export-Clixml -InputObject $changes -LiteralPath $journal -Depth 6 }
} catch {
    Restore-Files $changes
    throw
}
