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
            'name' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:5000',
            'category' => 'sometimes|string',
            'is_used' => 'sometimes|boolean',
            'allergens' => 'sometimes|string|nullable',
            'description' => 'sometimes|string|nullable',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string'   => 'Név formátuma nem megfelelő',
            'price.numeric'  => 'Ár formátuma nem megfelelő',
            'image.image'    => 'Kép formátuma nem megfelelő',
            'image.mimes'    => 'Kép formátuma nem megfelelő',
            'image.max'      => 'Kép mérete túl nagy',
            'category.string'   => 'Kategória formátuma nem megfelelő',
            'is_used.boolean'  => 'Használati állapot formátuma nem megfelelő',
            'allergens.string'   => 'Allergének formátuma nem megfelelő',
            'description.string'   => 'Leírás formátuma nem megfelelő',
        ];
    }
}
