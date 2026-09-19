<?php

namespace App\Support;

class EmailTemplate
{
    /**
     * @param  list<string>  $lines
     * @param  array<string, string|null>  $details
     */
    public function __construct(
        public readonly string $subject,
        public readonly string $headline,
        public readonly ?string $intro = null,
        public readonly array $lines = [],
        public readonly array $details = [],
        public readonly ?string $actionText = null,
        public readonly ?string $actionUrl = null,
        public readonly ?string $footerNote = null,
    ) {}
}
