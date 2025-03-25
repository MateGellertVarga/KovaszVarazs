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
            'name' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:5000',
        ];
    }

    public function messages():array {
        return [
            'name.required' => 'Név hiányzik',
            'name.string'   => 'Név formátuma nem megfelelő',
            'price.required' => 'Ár hiányzik',
            'price.numeric'  => 'Ár formátuma nem megfelelő',
            'image.image'    => 'Kép formátuma nem megfelelő',
            'image.mimes'    => 'Kép formátuma nem megfelelő',
            'image.max'      => 'Kép mérete túl nagy',
        ];
    }
}
