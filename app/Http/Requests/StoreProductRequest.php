<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string',
            'price' => 'required|numeric',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5000',
            'category' => 'required|string',
            'is_used' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Név hiányzik',
            'name.string'   => 'Név formátuma nem megfelelő',
            'price.required' => 'Ár hiányzik',
            'price.numeric'  => 'Ár formátuma nem megfelelő',
            'image.required' => 'Kép hiányzik',
            'image.image'    => 'Kép formátuma nem megfelelő',
            'image.mimes'    => 'Kép formátuma nem megfelelő',
            'image.max'      => 'Kép mérete túl nagy',
            'category.required' => 'Kategória hiányzik',
            'category.string'   => 'Kategória formátuma nem megfelelő',
            'is_used.required' => 'Használati állapot hiányzik',
            'is_used.boolean'  => 'Használati állapot formátuma nem megfelelő',
        ];
    }
}
