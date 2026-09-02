<?php

namespace App\Models\Concerns;

use App\Support\ImageStorage;
use App\Support\Locale;

trait SerializesStoredImages
{
    public function toArray()
    {
        $array = parent::toArray();

        if (isset($this->translations)) {
            $array = Locale::applyTranslations(
                $array,
                is_array($this->translations) ? $this->translations : null,
                $this->translatedFields()
            );
        }

        foreach ($this->storedImageFields() as $field) {
            if (! empty($array[$field])) {
                $array[$field] = ImageStorage::url($array[$field]) ?? $array[$field];
            }
        }

        foreach ($this->storedImageArrayFields() as $field) {
            if (! empty($array[$field]) && is_array($array[$field])) {
                $array[$field] = array_values(array_filter(array_map(
                    fn ($path) => ImageStorage::url($path) ?? $path,
                    $array[$field]
                )));
            }
        }

        return $array;
    }

    protected function storedImageArrayFields(): array
    {
        return property_exists($this, 'storedImageArrayFields')
            ? $this->storedImageArrayFields
            : [];
    }

    protected function translatedFields(): array
    {
        return property_exists($this, 'translatedFields')
            ? $this->translatedFields
            : [];
    }

    protected function storedImageFields(): array
    {
        return property_exists($this, 'storedImageFields')
            ? $this->storedImageFields
            : ['image'];
    }
}
