<x-mail::message>
    # Kedves {{ $user->name }}!

    Szeretnénk emlékeztetni, hogy a következő sütési napunk **{{ $schedule->available_date }}** napon lesz.
    Mivel még nem találtunk aktív rendelést tőled erre a napra, ezúton küldünk egy kis emlékeztetőt, hátha kiment a
    fejedből a rendelés leadása.

    <x-mail::button :url="'https://kovaszvarazs.com/rendeles'">
        Rendelés leadása
    </x-mail::button>

    Köszönjük szépen és további kellemes estét kívánunk!<br>

    Üdvözlettel,<br>
    Kovászvarázs
</x-mail::message>
