<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'total_dough_amount' => 'sometimes|required|integer|min:1',
            'ingredients' => 'sometimes|array',
            'ingredients.*.name' => 'required_with:ingredients|string|max:255',
            'ingredients.*.amount' => 'required_with:ingredients|numeric|min:0.1',
            'products' => 'sometimes|array',
            'products.*.product_id' => 'required_with:products|integer|exists:products,id',
            'products.*.quantity' => 'required_with:products|numeric|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'A recept neve nem lehet üres.',
            'name.string' => 'A recept neve szöveges formátumú kell legyen.',
            'total_dough_amount.required' => 'A teljes tésztamennyiség nem lehet üres.',
            'total_dough_amount.integer' => 'A teljes tésztamennyiség csak egész szám lehet.',
            'ingredients.array' => 'Az alapanyagok formátuma érvénytelen.',
            'ingredients.*.name.required' => 'Minden alapanyagnak kötelező nevet adni.',
            'ingredients.*.amount.required' => 'Minden alapanyaghoz kötelező mennyiséget megadni.',
            'products.array' => 'A csatolt termékek formátuma érvénytelen.',
            'products.*.product_id.required' => 'A termék azonosítója hiányzik.',
            'products.*.product_id.exists' => 'A kiválasztott termék nem létezik.',
            'products.*.quantity.required' => 'A termékhez tartozó tésztamennyiség megadása kötelező.',
        ];
    }
}
