<?php

namespace App\Actions;

use App\Models\Expense;

class CreateExpenseAction
{
    public function execute(array $data): Expense
    {
        return Expense::create($data);
    }
}
