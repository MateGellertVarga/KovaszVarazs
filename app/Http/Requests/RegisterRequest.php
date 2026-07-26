<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;
use App\Models\RegistrationRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => 'required|string',
            'email'        => 'required|email',
            'phone_number' => 'required|phone:SK,HU,RO,PL,CZ,AT,DE,INTERNATIONAL',
            'password'     => [
                'required',
                'string',
                'min:6',
                'regex:/[0-9]/',
            ],
            'role'         => 'required|in:user,admin'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'Név hiányzik',
            'email.required'        => 'Email cím hiányzik',
            'email.email'           => 'Email cím formátuma nem megfelelő',
            'phone_number.required' => 'Telefonszám hiányzik',
            'phone_number.phone'    => 'Telefonszám formátuma nem megfelelő',
            'password.required'     => 'Jelszó hiányzik',
            'password.min'          => 'A jelszónak minimum 6 karakter hosszúnak kell lennie',
            'password.regex'        => 'A jelszónak legalább egy számot tartalmaznia kell',
            'role.required'         => 'Szerepkör hiányzik',
            'role.in'               => 'Szerepkör nem megfelelő'
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $email = $this->input('email');

            if (User::where('email', $email)->exists()) {
                $validator->errors()->add('email', 'A fiókod már elfogadták, lépj be email címmel és jelszóval');
                return;
            }

            $existingRequest = RegistrationRequest::where('email', $email)
                ->orderBy('id', 'desc')
                ->first();

            if ($existingRequest) {
                if ($existingRequest->status === 'pending') {
                    $validator->errors()->add('email', 'Az adott email címhez már tartozik regisztráció, várd meg az admin jóváhagyását, vagy keresd fel üzenetben!');
                } elseif ($existingRequest->status === 'rejected') {
                    $validator->errors()->add('email', 'Ezzel az email címmel már elutasították a regisztrációt');
                } elseif ($existingRequest->status === 'approved') {
                    $validator->errors()->add('email', 'A fiókod már elfogadták, lépj be email címmel és jelszóval');
                }
            }
        });
    }
}
