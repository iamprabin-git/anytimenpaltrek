<x-mail::message>
# {{ $headline }}

@if (!empty($greeting))
{{ $greeting }}
@endif

@if (!empty($intro))
{{ $intro }}
@endif

@foreach ($lines as $line)
{{ $line }}

@endforeach

@if (!empty($details))
<x-mail::panel>
@foreach ($details as $label => $value)
**{{ $label }}:** {{ $value }}

@endforeach
</x-mail::panel>
@endif

@if (!empty($actionText) && !empty($actionUrl))
<x-mail::button :url="$actionUrl">
{{ $actionText }}
</x-mail::button>
@endif

@if (!empty($footerNote))
{{ $footerNote }}
@endif

Need help? Contact us at [{{ $supportEmail }}](mailto:{{ $supportEmail }})@if(!empty($supportPhone)) or call {{ $supportPhone }}@endif.

Thanks,<br>
{{ $companyName }}
</x-mail::message>
