<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary credentials
    |--------------------------------------------------------------------------
    |
    | Set CLOUDINARY_URL in .env (recommended):
    | cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    |
    | Or provide the individual values below.
    |
    */

    'url' => env('CLOUDINARY_URL'),

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),

    'api_key' => env('CLOUDINARY_API_KEY'),

    'api_secret' => env('CLOUDINARY_API_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Upload folder prefix
    |--------------------------------------------------------------------------
    |
    | Prepended to every public_id so assets stay grouped under one folder
    | in the Cloudinary Media Library, e.g. anytimenepaltrek/packages/uuid
    |
    */

    'folder_prefix' => env('CLOUDINARY_FOLDER', 'anytimenepaltrek'),

    /*
    |--------------------------------------------------------------------------
    | Default delivery transformations
    |--------------------------------------------------------------------------
    */

    'delivery' => [
        'fetch_format' => env('CLOUDINARY_FETCH_FORMAT', 'auto'),
        'quality' => env('CLOUDINARY_QUALITY', 'auto'),
    ],

];
