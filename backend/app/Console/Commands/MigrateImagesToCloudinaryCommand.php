<?php

namespace App\Console\Commands;

use App\Support\MigrateImagesToCloudinary;
use Illuminate\Console\Command;

class MigrateImagesToCloudinaryCommand extends Command
{
    protected $signature = 'images:migrate-to-cloudinary
                            {--dry-run : Preview migrations without uploading or saving}
                            {--delete-local : Delete local files after successful upload}';

    protected $description = 'Upload all locally stored images to Cloudinary and update database paths';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $deleteLocal = (bool) $this->option('delete-local');

        if ($deleteLocal && $dryRun) {
            $this->error('Use either --dry-run or --delete-local, not both.');

            return self::FAILURE;
        }

        $this->info($dryRun ? 'Dry run: no uploads or database changes will be made.' : 'Migrating local images to Cloudinary...');

        try {
            $result = (new MigrateImagesToCloudinary($dryRun, $deleteLocal))->run();
        } catch (\Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->table(
            ['Migrated', 'Skipped', 'Missing', 'Failed'],
            [[
                $result['migrated'],
                $result['skipped'],
                $result['missing'],
                $result['failed'],
            ]]
        );

        if (! empty($result['failures'])) {
            $this->warn('Issues:');
            foreach ($result['failures'] as $failure) {
                $this->line(" - {$failure}");
            }
        }

        if ($dryRun) {
            $this->comment('Run without --dry-run to perform the migration.');
        } else {
            $this->info('Migration complete.');
        }

        return ($result['failed'] ?? 0) > 0 ? self::FAILURE : self::SUCCESS;
    }
}
