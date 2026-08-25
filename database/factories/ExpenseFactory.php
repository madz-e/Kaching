<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{

    public function definition(): array
    {
        $parentCategory = Category::whereNull('parent_id')->inRandomOrder()->first();

        $subcategory = Category::where('parent_id', $parentCategory->id)->inRandomOrder()->first();

        $type=$parentCategory->id!=65?'expense':'income';

            return [
                'user_id'        => User::factory(),
                'category_id'    => $subcategory->id,
                'name'           => $subcategory->name,
                'amount'         => $this->faker->numberBetween(50, 3000),
                'date'           => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
                'payment_method' => $this->faker->randomElement(['card', 'cash']),
                'type'           => $type,
                'currency'       => 'MKD',
            ];
    }
}
