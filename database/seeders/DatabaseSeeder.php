<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'test1@test.com'],
            ['name' => 'test1', 'password' => Hash::make('password')]
        );

        User::updateOrCreate(
            ['email' => 'test2@test.com'],
            ['name' => 'test2', 'password' => Hash::make('password')]
        );

        if (User::count() < 5) {
            User::factory(3)->create();
        }

        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        $users->each(function ($user) {
            for ($i = 0; $i < 3; $i++) {
                $monthDate = Carbon::now()->subMonths($i);

                Expense::factory(50)->state(function () use ($user, $monthDate) {
                    $randomDay = $monthDate->copy()->startOfMonth()->addDays(rand(0, $monthDate->daysInMonth - 1));

                    return [
                        'user_id' => $user->id,
                        'date' => $randomDay->toDateString(),
                    ];
                })->create();
            }
        });
    }
}
