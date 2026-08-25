<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Food',       'icon' => 'food.svg','subcategories' => ['Breakfast', 'Brunch','Lunch', 'Dinner', 'Snacks', 'Dessert','Groceries']],
            ['name' => 'Drinks',     'icon' => 'drinks.svg', 'subcategories' => ['Coffee', 'Tea', 'Cocktail', 'Juice', 'Water','Drink']],
            ['name' => 'Transport',  'icon' => 'transport.svg','subcategories' => ['Fuel', 'Taxi', 'Bus', 'Parking','Metro','Train','Subway','Plane Tickets']],
            ['name' => 'Shopping',   'icon' => 'shopping.svg','subcategories' => ['Clothes', 'Shoes','Bag','Electronics', 'Beauty', 'Gifts','Accessories','Home Decor','Random Stuff']],
            ['name' => 'Entertainment',   'icon' => 'film.svg', 'subcategories' => ['Cinema','Books','Theater' ,'Games', 'Concert', 'Netflix','Amazon Prime','Disney Plus','Max','Activities']],
            ['name' => 'Housing',      'icon' => 'house.svg','subcategories' => ['Rent', 'Water Bill','Heating Bill','Electricity Bill','Phone Bill','Internet Bill','Laundry', 'Repairs', 'Furniture','Random Stuff']],
            ['name' => 'Health',    'icon' => 'heart.svg','subcategories' => ['Doctor', 'Medication', 'Psychologist','Psychiatrist', 'Supplements', 'Dentist','Toiletries']],
            ['name' => 'Income',     'icon' => 'income.svg','subcategories' => ['Salary', 'Freelance','Investment','Bonus','Pocket Money']],
            ['name' => 'Misc',       'icon' => 'misc.svg','subcategories' => ['Other','Gift','Tax']],
        ];

        foreach ($categories as $cat) {
            $parent = Category::create([
                'name' => $cat['name'],
                'icon' => $cat['icon'],
            ]);

            foreach ($cat['subcategories'] as $subName) {
                Category::create([
                    'name' => $subName,
                    'icon' => null,
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }
}
