<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'in:cash,card'],
            'type' => ['nullable', 'in:expense,income'],
            'name' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'currency' => ['nullable', 'string', 'max:10'],
        ];
    }
}
