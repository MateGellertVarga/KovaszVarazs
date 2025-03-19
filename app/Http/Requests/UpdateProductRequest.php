<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name'  => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric',
            'image_url' => 'sometimes|required|string'
        ];
    }
}
