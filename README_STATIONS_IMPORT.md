# Hectic — UK Stations Import & Export (Radio Browser)

This README gives you **copy/paste steps** to import **all UK radio stations** (GB) into your Hectic DB, validate streams, harvest Now‑Playing (ICY), and export to CSV for bulk admin import.

## 0) Prereqs
- Laravel 12 + PHP 8.3, MySQL 8
- `composer install`
- `.env` configured
- Queue driver: `redis` (recommended) or `database`

## 1) Add migrations and import/validate/nowplaying/export commands
Paste the command/migration code from the chat into your project (see sections: ImportUKStations, ValidateStreams, PollNowPlaying, ExportUKStations).

Then run:
```bash
php artisan migrate
php artisan stations:import-uk --fresh
php artisan stations:validate --limit=500
php artisan stations:nowplaying --limit=400
php artisan stations:export-uk --path=storage/uk_stations.csv
```

This will produce `storage/uk_stations.csv` with all live HTTPS UK stations.

## 2) Schedule (optional, keep fresh)
Edit `app/Console/Kernel.php`:
```php
$schedule->command('stations:import-uk')->dailyAt('03:00');
$schedule->command('stations:validate --limit=500')->everyTwoHours();
$schedule->command('stations:nowplaying --limit=400')->everyFiveMinutes();
```

## 3) Admin bulk import (optional path)
If you prefer CSV-first, import `storage/uk_stations.csv` into your admin bulk upload tool.

## 4) Columns in the CSV
`name,country,state,city,language,primary_stream_url,homepage,favicon,codec,bitrate,tags,stationuuid`

> Notes:
> - We only keep **HTTPS** streams to avoid mixed-content in apps.
> - `Now Playing` (ICY) is best-effort; many stations expose `StreamTitle` intermittently.
> - Some commercial stations use rotating tokens; validation will mark them dead if they block generic clients.