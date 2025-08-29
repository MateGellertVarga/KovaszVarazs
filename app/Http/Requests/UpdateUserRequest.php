<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($this->user()->id)
            ],
            'phone_number' => 'sometimes|nullable|phone:SK,HU,RO,PL,CZ,AT,DE,INTERNATIONAL',
            'password'     => 'sometimes|required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Név hiányzik',
            'name.string'   => 'Név formátuma nem megfelelő',
            'email.required' => 'Email hiányzik',
            'email.email'    => 'Email formátuma nem megfelelő',
            'email.unique'   => 'Email már létezik',
            'phone_number.phone' => 'Telefonszám formátuma nem megfelelő',
            'password.required' => 'Jelszó hiányzik',
            'password.string'   => 'Jelszó formátuma nem megfelelő',
            'password.min'      => 'Jelszónak legalább 8 karakternek kell lennie',
            'password.regex'    => 'Jelszónak legalább 1 nagybetűt, 1 kisbetűt, 1 számot és 1 speciális karaktert kell tartalmaznia',
        ];
    }
}
