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
            'password'     => [
                'required',
                'string',
                'min:6',
                'regex:/[0-9]/',
            ],
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
            'password.min'          => 'A jelszónak minimum 6 karakter hosszúnak kell lennie',
            'password.regex'        => 'A jelszónak legalább egy számot tartalmaznia kell',
        ];
    }
}
