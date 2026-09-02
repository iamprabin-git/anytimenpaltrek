<?php

namespace App\Support;

use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;
use RuntimeException;
use Throwable;

class ImageStorage
{
    private const LOCAL_DISK = 'public';

    private static ?ImageManager $manager = null;

    private static ?UploadApi $uploadApi = null;

    public static function driver(): string
    {
        return strtolower((string) config('filesystems.image_storage', env('IMAGE_STORAGE_DRIVER', 'local')));
    }

    public static function usesCloudinary(): bool
    {
        return self::driver() === 'cloudinary' && self::cloudinaryConfigured();
    }

    public static function cloudinaryConfigured(): bool
    {
        if (filled(config('cloudinary.url'))) {
            return true;
        }

        return filled(config('cloudinary.cloud_name'))
            && filled(config('cloudinary.api_key'))
            && filled(config('cloudinary.api_secret'));
    }

    public static function manager(): ImageManager
    {
        if (self::$manager) {
            return self::$manager;
        }

        $preferred = strtolower((string) env('IMAGE_DRIVER', 'auto'));

        if ($preferred === 'imagick' && extension_loaded('imagick')) {
            return self::$manager = ImageManager::usingDriver(ImagickDriver::class);
        }

        if ($preferred === 'gd' && extension_loaded('gd')) {
            return self::$manager = ImageManager::usingDriver(GdDriver::class);
        }

        if ($preferred === 'auto' || $preferred === '') {
            if (extension_loaded('imagick')) {
                return self::$manager = ImageManager::usingDriver(ImagickDriver::class);
            }

            if (extension_loaded('gd')) {
                return self::$manager = ImageManager::usingDriver(GdDriver::class);
            }
        }

        throw new RuntimeException(
            'Enable the PHP GD or Imagick extension to process image uploads. '
            .'On Windows, uncomment extension=gd in php.ini or install the imagick PECL extension, then restart PHP.'
        );
    }

    public static function canProcess(): bool
    {
        return extension_loaded('gd') || extension_loaded('imagick');
    }

    /**
     * Turn a stored path/public_id into a public URL for API responses.
     */
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (self::isRemote($path)) {
            return $path;
        }

        if (self::isCloudinaryPath($path)) {
            return self::cloudinaryUrl($path);
        }

        return Storage::disk(self::LOCAL_DISK)->url($path);
    }

    public static function isRemote(?string $path): bool
    {
        if (! $path) {
            return false;
        }

        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
    }

    public static function isCloudinaryPath(?string $path): bool
    {
        if (! $path || self::isRemote($path)) {
            return false;
        }

        $prefix = self::cloudinaryPrefix();
        if ($prefix && str_starts_with($path, $prefix.'/')) {
            return true;
        }

        // Cloudinary public_ids are stored without a file extension; local paths use .webp etc.
        return self::usesCloudinary() && ! self::hasFileExtension($path);
    }

    public static function isStoredPath(?string $path): bool
    {
        return (bool) $path && ! self::isRemote($path);
    }

    public static function isLocalStoredPath(?string $path): bool
    {
        if (! self::isStoredPath($path) || self::isCloudinaryPath($path)) {
            return false;
        }

        if (Storage::disk(self::LOCAL_DISK)->exists($path)) {
            return true;
        }

        return self::hasFileExtension($path);
    }

    /**
     * Upload an existing local storage file to Cloudinary.
     * Returns the Cloudinary public_id, or the original value when already migrated/external.
     */
    public static function migrateLocalPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (self::isRemote($path) || self::isCloudinaryPath($path)) {
            return $path;
        }

        if (! Storage::disk(self::LOCAL_DISK)->exists($path)) {
            return null;
        }

        if (! self::cloudinaryConfigured()) {
            throw new RuntimeException('Cloudinary credentials are not configured.');
        }

        $absolutePath = Storage::disk(self::LOCAL_DISK)->path($path);
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION) ?: '');
        $publicId = self::publicIdFromLocalPath($path);

        $uploadOptions = [
            'public_id' => $publicId,
            'overwrite' => true,
            'resource_type' => 'image',
        ];

        if ($extension !== 'svg') {
            $uploadOptions['transformation'] = [
                [
                    'quality' => config('cloudinary.delivery.quality', 'auto'),
                    'fetch_format' => config('cloudinary.delivery.fetch_format', 'auto'),
                ],
            ];
        }

        $result = self::uploadApi()->upload($absolutePath, $uploadOptions);

        return (string) ($result['public_id'] ?? $publicId);
    }

    public static function deleteLocalPath(?string $path): void
    {
        if (! $path || self::isRemote($path) || self::isCloudinaryPath($path)) {
            return;
        }

        if (Storage::disk(self::LOCAL_DISK)->exists($path)) {
            Storage::disk(self::LOCAL_DISK)->delete($path);
        }
    }

    /**
     * Process and store an uploaded image. Returns the storage path/public_id only.
     */
    public static function store(UploadedFile $file, string $folder, array $options = []): string
    {
        if (self::driver() === 'cloudinary') {
            if (! self::cloudinaryConfigured()) {
                throw new RuntimeException(
                    'IMAGE_STORAGE_DRIVER is set to cloudinary but Cloudinary credentials are missing. '
                    .'Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
                );
            }

            return self::storeOnCloudinary($file, $folder, $options);
        }

        return self::storeLocally($file, $folder, $options);
    }

    public static function delete(?string $path): void
    {
        if (! self::isStoredPath($path)) {
            return;
        }

        if (self::isCloudinaryPath($path)) {
            try {
                self::uploadApi()->destroy($path, ['resource_type' => 'image']);
            } catch (Throwable) {
                // Ignore missing assets during cleanup.
            }

            return;
        }

        if (Storage::disk(self::LOCAL_DISK)->exists($path)) {
            Storage::disk(self::LOCAL_DISK)->delete($path);
        }
    }

    public static function fileRules(bool $required = false): string
    {
        $prefix = $required ? 'required|' : 'nullable|';

        return $prefix.'file|mimes:jpg,jpeg,png,webp,gif|max:5120';
    }

    public static function logoRules(bool $required = false): string
    {
        $prefix = $required ? 'required|' : 'nullable|';

        return $prefix.'file|mimes:jpg,jpeg,png,webp,svg|max:4096';
    }

    private static function storeLocally(UploadedFile $file, string $folder, array $options = []): string
    {
        $folder = trim($folder, '/');
        $extension = strtolower($file->getClientOriginalExtension() ?: '');

        if ($extension === 'svg' || ! self::canProcess()) {
            return self::normalizePath($file->store($folder, self::LOCAL_DISK));
        }

        $maxWidth = $options['max_width'] ?? 1600;
        $quality = $options['quality'] ?? 85;
        $format = $options['format'] ?? Format::WEBP;

        $image = self::manager()->read($file->getRealPath());

        if ($image->width() > $maxWidth) {
            $image->scale(width: $maxWidth);
        }

        $filename = Str::uuid()->toString().'.'.self::extensionForFormat($format);
        $path = $folder.'/'.$filename;

        $encoded = $image->encodeUsingFormat($format, quality: $quality);
        Storage::disk(self::LOCAL_DISK)->put($path, (string) $encoded);

        return $path;
    }

    private static function storeOnCloudinary(UploadedFile $file, string $folder, array $options = []): string
    {
        $folder = trim($folder, '/');
        $publicId = self::buildCloudinaryPublicId($folder);
        $extension = strtolower($file->getClientOriginalExtension() ?: '');
        $maxWidth = $options['max_width'] ?? 1600;

        $uploadOptions = [
            'public_id' => $publicId,
            'overwrite' => true,
            'resource_type' => 'image',
        ];

        if ($extension !== 'svg') {
            $uploadOptions['transformation'] = [
                ['width' => $maxWidth, 'crop' => 'limit'],
                [
                    'quality' => config('cloudinary.delivery.quality', 'auto'),
                    'fetch_format' => config('cloudinary.delivery.fetch_format', 'auto'),
                ],
            ];
        }

        $result = self::uploadApi()->upload($file->getRealPath(), $uploadOptions);

        return (string) ($result['public_id'] ?? $publicId);
    }

    private static function cloudinaryUrl(string $publicId): string
    {
        $cloudName = self::cloudName();
        $format = config('cloudinary.delivery.fetch_format', 'auto');
        $quality = config('cloudinary.delivery.quality', 'auto');

        return "https://res.cloudinary.com/{$cloudName}/image/upload/f_{$format},q_{$quality}/{$publicId}";
    }

    private static function buildCloudinaryPublicId(string $folder): string
    {
        $publicId = trim($folder, '/').'/'.Str::uuid()->toString();
        $prefix = self::cloudinaryPrefix();

        if ($prefix) {
            $publicId = $prefix.'/'.$publicId;
        }

        return $publicId;
    }

    public static function publicIdFromLocalPath(string $path): string
    {
        $path = self::normalizePath($path);
        $folder = trim(dirname($path), '/.');
        $filename = pathinfo($path, PATHINFO_FILENAME);
        $publicId = $folder !== '' ? $folder.'/'.$filename : $filename;
        $prefix = self::cloudinaryPrefix();

        if ($prefix) {
            $publicId = $prefix.'/'.$publicId;
        }

        return $publicId;
    }

    private static function cloudinaryPrefix(): string
    {
        return trim((string) config('cloudinary.folder_prefix', ''), '/');
    }

    private static function cloudName(): string
    {
        if (filled(config('cloudinary.cloud_name'))) {
            return (string) config('cloudinary.cloud_name');
        }

        if (self::cloudinaryConfigured()) {
            $cloudName = self::cloudinaryConfiguration()->cloud->cloudName;
            if ($cloudName) {
                return $cloudName;
            }
        }

        $url = (string) config('cloudinary.url', '');
        if (preg_match('@cloudinary://[^@]+@([^/?]+)@', $url, $matches)) {
            return $matches[1];
        }

        return 'cloudinary';
    }

    private static function uploadApi(): UploadApi
    {
        if (! self::$uploadApi) {
            self::$uploadApi = new UploadApi(self::cloudinaryConfiguration());
        }

        return self::$uploadApi;
    }

    private static function cloudinaryConfiguration(): Configuration
    {
        if (filled(config('cloudinary.url'))) {
            return new Configuration((string) config('cloudinary.url'));
        }

        return new Configuration([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }

    private static function hasFileExtension(string $path): bool
    {
        return (bool) preg_match('/\.(webp|jpg|jpeg|png|gif|svg)$/i', $path);
    }

    private static function normalizePath(string $path): string
    {
        return str_replace('\\', '/', $path);
    }

    private static function extensionForFormat(Format $format): string
    {
        return match ($format) {
            Format::WEBP => 'webp',
            Format::JPEG => 'jpg',
            Format::PNG => 'png',
            Format::GIF => 'gif',
            default => 'webp',
        };
    }
}
