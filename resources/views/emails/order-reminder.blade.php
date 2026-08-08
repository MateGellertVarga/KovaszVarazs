<!DOCTYPE html>
<html lang="hu">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendelés emlékeztető - Kovászvarázs</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
</head>

<body
    style="margin: 0; padding: 0; background-color: #f8eada; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%"
        style="background-color: #f8eada; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; background-color: #fff7ec; border-radius: 20px; overflow: hidden; border: 1px solid rgba(198, 137, 88, 0.2);">

                    <!-- Fejléc sáv (Gomb színű háttér, fehér Pacifico betűkkel) -->
                    <tr>
                        <td align="center" style="background-color: #c68958; padding: 35px 30px;">
                            <h1
                                style="color: #ffffff; margin: 0; font-size: 38px; font-weight: normal; font-family: 'Pacifico', 'Brush Script MT', cursive;">
                                Kovászvarázs
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px 30px 30px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="background-color: #ffffff; border-radius: 16px; border: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 4px 12px rgba(122, 83, 52, 0.05);">
                                <tr>
                                    <td style="padding: 40px 30px; color: #374151; font-size: 16px; line-height: 1.6;">

                                        <h2
                                            style="color: #7a5334; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600; font-family: Georgia, serif;">
                                            Kedves {{ $user->name }}!
                                        </h2>

                                        <p style="margin-bottom: 20px; color: #374151;">
                                            Szeretnénk emlékeztetni, hogy a következő sütésünk
                                            <span
                                                style="display: inline-block; background-color: #fff7ec; color: #7a5334; padding: 4px 10px; border-radius: 8px; font-weight: 600; border: 1px solid rgba(198, 137, 88, 0.2);">
                                                {{ \Carbon\Carbon::parse($schedule->available_date)->locale('hu')->translatedFormat('Y.m.d l') }}
                                            </span> napon lesz.
                                        </p>

                                        <p style="margin-bottom: 30px; color: #4b5563;">
                                            Mivel még nem találtunk aktív rendelést tőled erre a napra, ezúton küldünk
                                            egy kis emlékeztetőt, hátha kiment a fejedből a rendelés leadása.
                                        </p>

                                        <!-- CTA Gomb -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center" style="padding: 10px 0 25px 0;">
                                                    <a href="https://kovaszvarazs.com/rendeles" target="_blank"
                                                        style="background-color: #c68958; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(198, 137, 88, 0.25);">
                                                        Rendelés leadása
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p
                                            style="margin-top: 10px; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 20px; font-size: 14px; color: #6b7280; line-height: 1.5;">
                                            Köszönjük szépen és további kellemes estét kívánunk!<br><br>
                                            Üdvözlettel,<br>
                                            <strong style="color: #7a5334;">Kovászvarázs</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Lábléc -->
                    <tr>
                        <td align="center" style="padding: 0 30px 30px 30px; color: #8c735d; font-size: 13px;">
                            <p style="margin: 0;">© {{ date('Y') }} Kovászvarázs</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
