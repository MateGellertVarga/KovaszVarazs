<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'total_dough_amount' => 'required|integer|min:1',
            'ingredients' => 'sometimes|array',
            'ingredients.*.name' => 'required|string|max:255',
            'ingredients.*.amount' => 'required|numeric|min:0.1',
            'products' => 'sometimes|array',
            'products.*.product_id' => 'required|integer|exists:products,id',
            'products.*.quantity' => 'required|numeric|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'A recept neve hiányzik.',
            'name.string' => 'A recept neve szöveges formátumú kell legyen.',
            'total_dough_amount.required' => 'A teljes tésztamennyiség megadása kötelező.',
            'total_dough_amount.integer' => 'A teljes tésztamennyiség csak egész szám lehet.',
            'total_dough_amount.min' => 'A teljes tésztamennyiségnek legalább 1 grammnak kell lennie.',
            'ingredients.array' => 'Az alapanyagok formátuma érvénytelen (tömb várt).',
            'ingredients.*.name.required' => 'Minden alapanyagnak kötelező nevet adni.',
            'ingredients.*.amount.required' => 'Minden alapanyaghoz kötelező mennyiséget megadni.',
            'ingredients.*.amount.numeric' => 'Az alapanyag mennyisége csak szám lehet.',
            'products.array' => 'A csatolt termékek formátuma érvénytelen.',
            'products.*.product_id.required' => 'A termék azonosítója hiányzik.',
            'products.*.product_id.exists' => 'A kiválasztott termék nem létezik az adatbázisban.',
            'products.*.quantity.required' => 'A termékhez tartozó tésztamennyiség megadása kötelező.',
            'products.*.quantity.numeric' => 'A termékhez tartozó tésztamennyiség csak szám lehet.',
        ];
    }
}
