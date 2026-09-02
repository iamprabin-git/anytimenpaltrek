<?php

namespace App\Support;

use App\Models\BlogPost;
use App\Models\Booking;
use App\Models\CompanySetting;
use App\Models\Destination;
use App\Models\HeroSlide;
use App\Models\Package;
use App\Models\Review;
use App\Models\SiteContent;
use App\Models\User;
use App\Models\UserPhoto;

class MigrateImagesToCloudinary
{
    /** @var array{migrated:int, skipped:int, missing:int, failed:int} */
    private array $stats = [
        'migrated' => 0,
        'skipped' => 0,
        'missing' => 0,
        'failed' => 0,
    ];

    /** @var list<string> */
    private array $failures = [];

    public function __construct(
        private readonly bool $dryRun = false,
        private readonly bool $deleteLocal = false,
    ) {}

    /** @return array{migrated:int, skipped:int, missing:int, failed:int, failures:list<string>} */
    public function run(): array
    {
        if (! ImageStorage::cloudinaryConfigured()) {
            throw new \RuntimeException('Cloudinary is not configured. Set CLOUDINARY_URL in .env first.');
        }

        $this->migratePackages();
        $this->migrateHeroSlides();
        $this->migrateDestinations();
        $this->migrateBlogPosts();
        $this->migrateReviews();
        $this->migrateCompanySettings();
        $this->migrateUsers();
        $this->migrateUserPhotos();
        $this->migrateBookings();
        $this->migrateSiteContents();

        return [
            ...$this->stats,
            'failures' => $this->failures,
        ];
    }

    /** @return array{migrated:int, skipped:int, missing:int, failed:int} */
    public function stats(): array
    {
        return $this->stats;
    }

    private function migratePackages(): void
    {
        Package::query()->chunkById(50, function ($packages) {
            foreach ($packages as $package) {
                $image = $this->migratePath($package->getRawOriginal('image'), 'Package#'.$package->id.' image');
                $gallery = $this->migratePathList($package->getRawOriginal('gallery_images') ?? [], 'Package#'.$package->id.' gallery');

                if ($this->dryRun) {
                    continue;
                }

                $dirty = false;
                if ($image !== $package->getRawOriginal('image')) {
                    $package->image = $image;
                    $dirty = true;
                }
                if ($gallery !== ($package->getRawOriginal('gallery_images') ?? [])) {
                    $package->gallery_images = $gallery;
                    $dirty = true;
                }
                if ($dirty) {
                    $package->save();
                }
            }
        });
    }

    private function migrateHeroSlides(): void
    {
        HeroSlide::query()->chunkById(50, function ($slides) {
            foreach ($slides as $slide) {
                $image = $this->migratePath($slide->getRawOriginal('image'), 'HeroSlide#'.$slide->id);

                if (! $this->dryRun && $image !== $slide->getRawOriginal('image')) {
                    $slide->image = $image;
                    $slide->save();
                }
            }
        });
    }

    private function migrateDestinations(): void
    {
        Destination::query()->chunkById(50, function ($destinations) {
            foreach ($destinations as $destination) {
                $image = $this->migratePath($destination->getRawOriginal('image'), 'Destination#'.$destination->id);

                if (! $this->dryRun && $image !== $destination->getRawOriginal('image')) {
                    $destination->image = $image;
                    $destination->save();
                }
            }
        });
    }

    private function migrateBlogPosts(): void
    {
        BlogPost::query()->chunkById(50, function ($posts) {
            foreach ($posts as $post) {
                $image = $this->migratePath($post->getRawOriginal('image'), 'BlogPost#'.$post->id);
                $gallery = $this->migratePathList($post->getRawOriginal('gallery_images') ?? [], 'BlogPost#'.$post->id.' gallery');

                if ($this->dryRun) {
                    continue;
                }

                $dirty = false;
                if ($image !== $post->getRawOriginal('image')) {
                    $post->image = $image;
                    $dirty = true;
                }
                if ($gallery !== ($post->getRawOriginal('gallery_images') ?? [])) {
                    $post->gallery_images = $gallery;
                    $dirty = true;
                }
                if ($dirty) {
                    $post->save();
                }
            }
        });
    }

    private function migrateReviews(): void
    {
        Review::query()->chunkById(50, function ($reviews) {
            foreach ($reviews as $review) {
                $avatar = $this->migratePath($review->getRawOriginal('author_avatar'), 'Review#'.$review->id.' avatar');
                $gallery = $this->migratePathList($review->getRawOriginal('gallery_images') ?? [], 'Review#'.$review->id.' gallery');

                if ($this->dryRun) {
                    continue;
                }

                $dirty = false;
                if ($avatar !== $review->getRawOriginal('author_avatar')) {
                    $review->author_avatar = $avatar;
                    $dirty = true;
                }
                if ($gallery !== ($review->getRawOriginal('gallery_images') ?? [])) {
                    $review->gallery_images = $gallery;
                    $dirty = true;
                }
                if ($dirty) {
                    $review->save();
                }
            }
        });
    }

    private function migrateCompanySettings(): void
    {
        $settings = CompanySetting::query()->get();
        foreach ($settings as $setting) {
            $logo = $this->migratePath($setting->getRawOriginal('logo'), 'CompanySetting#'.$setting->id.' logo');
            $dynamic = $setting->dynamic_settings ?? [];
            $qrCode = $dynamic['payment_settings']['qr_code'] ?? null;
            $migratedQr = $this->migratePath($qrCode, 'CompanySetting#'.$setting->id.' qr_code');

            if ($this->dryRun) {
                continue;
            }

            $dirty = false;
            if ($logo !== $setting->getRawOriginal('logo')) {
                $setting->logo = $logo;
                $dirty = true;
            }
            if ($migratedQr !== $qrCode) {
                $dynamic['payment_settings']['qr_code'] = $migratedQr;
                $setting->dynamic_settings = $dynamic;
                $dirty = true;
            }
            if ($dirty) {
                $setting->save();
            }
        }
    }

    private function migrateUsers(): void
    {
        User::query()->chunkById(50, function ($users) {
            foreach ($users as $user) {
                $avatar = $this->migratePath($user->getRawOriginal('avatar'), 'User#'.$user->id.' avatar');

                if (! $this->dryRun && $avatar !== $user->getRawOriginal('avatar')) {
                    $user->avatar = $avatar;
                    $user->save();
                }
            }
        });
    }

    private function migrateUserPhotos(): void
    {
        UserPhoto::query()->chunkById(50, function ($photos) {
            foreach ($photos as $photo) {
                $image = $this->migratePath($photo->getRawOriginal('image'), 'UserPhoto#'.$photo->id);

                if (! $this->dryRun && $image !== $photo->getRawOriginal('image')) {
                    $photo->image = $image;
                    $photo->save();
                }
            }
        });
    }

    private function migrateBookings(): void
    {
        Booking::query()->chunkById(50, function ($bookings) {
            foreach ($bookings as $booking) {
                $proof = $this->migratePath($booking->getRawOriginal('payment_proof'), 'Booking#'.$booking->id);

                if (! $this->dryRun && $proof !== $booking->getRawOriginal('payment_proof')) {
                    $booking->payment_proof = $proof;
                    $booking->save();
                }
            }
        });
    }

    private function migrateSiteContents(): void
    {
        SiteContent::query()->chunkById(20, function ($records) {
            foreach ($records as $record) {
                $content = $record->content ?? [];
                $migrated = $this->migrateTree($content);

                if (! $this->dryRun && $migrated !== $content) {
                    $record->content = $migrated;
                    $record->save();
                }
            }
        });
    }

    private function migratePath(?string $path, string $label): ?string
    {
        if (! $path) {
            return null;
        }

        if (ImageStorage::isRemote($path) || ImageStorage::isCloudinaryPath($path)) {
            $this->stats['skipped']++;

            return $path;
        }

        if (! ImageStorage::isLocalStoredPath($path)) {
            $this->stats['missing']++;
            $this->failures[] = "{$label}: local file not found ({$path})";

            return $path;
        }

        if ($this->dryRun) {
            $this->stats['migrated']++;

            return ImageStorage::publicIdFromLocalPath($path);
        }

        try {
            $migrated = ImageStorage::migrateLocalPath($path);
            if (! $migrated) {
                $this->stats['missing']++;
                $this->failures[] = "{$label}: local file missing or upload returned empty ({$path})";

                return $path;
            }

            if ($this->deleteLocal) {
                ImageStorage::deleteLocalPath($path);
            }

            $this->stats['migrated']++;

            return $migrated;
        } catch (\Throwable $exception) {
            $this->stats['failed']++;
            $this->failures[] = "{$label}: {$exception->getMessage()} ({$path})";

            return $path;
        }
    }

    /** @param  array<int, string|null>  $paths */
    private function migratePathList(?array $paths, string $label): array
    {
        if (! is_array($paths)) {
            return [];
        }

        $result = [];
        foreach (array_values($paths) as $index => $path) {
            $result[] = $this->migratePath(is_string($path) ? $path : null, "{$label}[{$index}]") ?? $path;
        }

        return $result;
    }

    /** @param  mixed  $value */
    private function migrateTree(mixed $value): mixed
    {
        if (is_string($value)) {
            if (! ImageStorage::isLocalStoredPath($value)) {
                return $value;
            }

            return $this->migratePath($value, 'site_content') ?? $value;
        }

        if (! is_array($value)) {
            return $value;
        }

        $result = [];
        foreach ($value as $key => $item) {
            $result[$key] = $this->migrateTree($item);
        }

        return $result;
    }
}
