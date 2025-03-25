<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'email'        => 'required|email|unique:users,email',
            'phone_number' => 'required|phone:SK,HU,RO,PL,CZ,AT,DE,INTERNATIONAL',
            'password'     => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'role'         => 'required|in:user,admin'
        ];
    }

    public function messages(): array {
        return [
            'name.required'         => 'Név hiányzik',
            'email.required'        => 'Email cím hiányzik',
            'email.email'           => 'Email cím formátuma nem megfelelő',
            'email.unique'          => 'Email cím már használatban van',
            'phone_number.required' => 'Telefonszám hiányzik',
            'phone_number.phone'    => 'Telefonszám formátuma nem megfelelő',
            'password.required'     => 'Jelszó hiányzik',
            'password.min'          => 'Jelszónak minimum 8 karakter hosszúnak kell lennie',
            'password.regex'        => 'Jelszónak legalább egy kisbetűt, egy nagybetűt, egy számot és egy speciális karaktert kell tartalmaznia',
            'role.required'         => 'Role hiányzik',
            'role.in'               => 'Role nem megfelelő'
        ];
    }
}
