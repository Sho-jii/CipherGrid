$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $repositoryRoot 'public\assets\ciphergrid-logo.png'
$androidResources = Join-Path $repositoryRoot 'android\app\src\main\res'
$ivory = [System.Drawing.ColorTranslator]::FromHtml('#F2F0E9')
$dark = [System.Drawing.ColorTranslator]::FromHtml('#10141B')
$blue = [System.Drawing.ColorTranslator]::FromHtml('#2347FF')
$orange = [System.Drawing.ColorTranslator]::FromHtml('#FF5A1F')
$border = [System.Drawing.ColorTranslator]::FromHtml('#7E8793')

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "CipherGrid source logo was not found at $sourcePath"
}

function New-Canvas([int]$width, [int]$height) {
    return [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Set-Quality([System.Drawing.Graphics]$graphics) {
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
}

function Save-Png([System.Drawing.Bitmap]$bitmap, [string]$path) {
    $directory = Split-Path -Parent $path
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Write-Launcher([System.Drawing.Image]$source, [int]$size, [string]$path, [bool]$round) {
    $bitmap = New-Canvas $size $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        Set-Quality $graphics
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $brush = [System.Drawing.SolidBrush]::new($ivory)
        try {
            if ($round) {
                $graphics.FillEllipse($brush, 0, 0, $size, $size)
            } else {
                $graphics.FillRectangle($brush, 0, 0, $size, $size)
            }
        } finally {
            $brush.Dispose()
        }
        $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $size, $size))
        Save-Png $bitmap $path
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Write-Foreground([System.Drawing.Image]$source, [int]$size, [string]$path) {
    $bitmap = New-Canvas $size $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        Set-Quality $graphics
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $size, $size))
        Save-Png $bitmap $path
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Write-Splash([System.Drawing.Image]$source, [int]$width, [int]$height, [string]$path) {
    $bitmap = New-Canvas $width $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        Set-Quality $graphics
        $graphics.Clear($dark)

        $plaqueSize = [int]([Math]::Min($width, $height) * 0.38)
        $offset = [Math]::Max(4, [int]($plaqueSize * 0.06))
        $left = [int](($width - $plaqueSize) / 2)
        $top = [int](($height - $plaqueSize) / 2)

        $blueBrush = [System.Drawing.SolidBrush]::new($blue)
        $orangeBrush = [System.Drawing.SolidBrush]::new($orange)
        $ivoryBrush = [System.Drawing.SolidBrush]::new($ivory)
        try {
            $graphics.FillRectangle($blueBrush, $left + $offset, $top + $offset, $plaqueSize, $plaqueSize)
            $graphics.FillRectangle($orangeBrush, $left - $offset, $top - $offset, $plaqueSize, $plaqueSize)
            $graphics.FillRectangle($ivoryBrush, $left, $top, $plaqueSize, $plaqueSize)
        } finally {
            $blueBrush.Dispose()
            $orangeBrush.Dispose()
            $ivoryBrush.Dispose()
        }

        $graphics.DrawImage($source, [System.Drawing.Rectangle]::new($left, $top, $plaqueSize, $plaqueSize))
        Save-Png $bitmap $path
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Write-ReadmeLogo([System.Drawing.Image]$source, [string]$path) {
    $canvasSize = 512
    $plaqueSize = 384
    $offset = 18
    $left = [int](($canvasSize - $plaqueSize) / 2)
    $top = [int](($canvasSize - $plaqueSize) / 2)
    $bitmap = New-Canvas $canvasSize $canvasSize
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        Set-Quality $graphics
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $blueBrush = [System.Drawing.SolidBrush]::new($blue)
        $orangeBrush = [System.Drawing.SolidBrush]::new($orange)
        $ivoryBrush = [System.Drawing.SolidBrush]::new($ivory)
        $borderPen = [System.Drawing.Pen]::new($border, 4)
        try {
            $graphics.FillRectangle($blueBrush, $left + $offset, $top + $offset, $plaqueSize, $plaqueSize)
            $graphics.FillRectangle($orangeBrush, $left - $offset, $top - $offset, $plaqueSize, $plaqueSize)
            $graphics.FillRectangle($ivoryBrush, $left, $top, $plaqueSize, $plaqueSize)
            $graphics.DrawRectangle($borderPen, $left, $top, $plaqueSize - 1, $plaqueSize - 1)
            $graphics.DrawImage($source, [System.Drawing.Rectangle]::new($left, $top, $plaqueSize, $plaqueSize))
        } finally {
            $blueBrush.Dispose()
            $orangeBrush.Dispose()
            $ivoryBrush.Dispose()
            $borderPen.Dispose()
        }
        Save-Png $bitmap $path
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

$source = [System.Drawing.Image]::FromFile($sourcePath)
try {
    $densitySizes = [ordered]@{
        'mdpi' = @{ Icon = 48; Foreground = 108 }
        'hdpi' = @{ Icon = 72; Foreground = 162 }
        'xhdpi' = @{ Icon = 96; Foreground = 216 }
        'xxhdpi' = @{ Icon = 144; Foreground = 324 }
        'xxxhdpi' = @{ Icon = 192; Foreground = 432 }
    }

    foreach ($density in $densitySizes.Keys) {
        $directory = Join-Path $androidResources "mipmap-$density"
        $iconSize = $densitySizes[$density].Icon
        $foregroundSize = $densitySizes[$density].Foreground
        Write-Launcher $source $iconSize (Join-Path $directory 'ic_launcher.png') $false
        Write-Launcher $source $iconSize (Join-Path $directory 'ic_launcher_round.png') $true
        Write-Foreground $source $foregroundSize (Join-Path $directory 'ic_launcher_foreground.png')
    }

    Write-Launcher $source 1024 (Join-Path $repositoryRoot 'public\assets\ciphergrid-app-icon.png') $false
    Write-ReadmeLogo $source (Join-Path $repositoryRoot 'public\assets\ciphergrid-readme-logo.png')

    Get-ChildItem -Path $androidResources -Recurse -Filter 'splash.png' | ForEach-Object {
        $existing = [System.Drawing.Image]::FromFile($_.FullName)
        try {
            $width = $existing.Width
            $height = $existing.Height
        } finally {
            $existing.Dispose()
        }
        Write-Splash $source $width $height $_.FullName
    }
} finally {
    $source.Dispose()
}

Write-Host 'CipherGrid Android launcher, adaptive foreground, README logo, PWA icon, and splash assets generated.'
