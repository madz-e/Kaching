<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReceiptScanController extends Controller
{
    public function scan(Request $request)
    {
        $request->validate([
            'receipt' => 'required|image|max:10485760',
        ]);

        $imageFile = $request->file('receipt');
        $imageBase64 = base64_encode(file_get_contents($imageFile->path()));
        $mimeType = $imageFile->getMimeType();

        $categoriesContext = json_encode([
            ['name' => 'Food', 'subcategories' => ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Groceries']],
            ['name' => 'Drinks', 'subcategories' => ['Coffee', 'Tea', 'Cocktail', 'Juice', 'Water', 'Drink']],
            ['name' => 'Transport', 'subcategories' => ['Fuel', 'Taxi', 'Bus', 'Parking', 'Metro', 'Train', 'Subway', 'Plane Tickets']],
            ['name' => 'Shopping', 'subcategories' => ['Clothes', 'Shoes', 'Bag', 'Electronics', 'Beauty', 'Gifts', 'Accessories', 'Home Decor', 'Random Stuff']],
            ['name' => 'Entertainment', 'subcategories' => ['Cinema', 'Books', 'Theater', 'Games', 'Concert', 'Netflix', 'Amazon Prime', 'Disney Plus', 'Max', 'Activities']],
            ['name' => 'Housing', 'subcategories' => ['Rent', 'Water Bill', 'Heating Bill', 'Electricity Bill', 'Phone Bill', 'Internet Bill', 'Laundry', 'Repairs', 'Furniture', 'Random Stuff']],
            ['name' => 'Health', 'subcategories' => ['Doctor', 'Medication', 'Psychologist', 'Psychiatrist', 'Supplements', 'Dentist', 'Toiletries']],
            ['name' => 'Income', 'subcategories' => ['Salary', 'Freelance', 'Investment', 'Bonus', 'Pocket Money']],
            ['name' => 'Misc', 'subcategories' => ['Other', 'Gift', 'Tax']],
        ]);

        $apiKey = env('GEMINI_API_KEY');

        $response = Http::withoutVerifying()->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => 'You are a receipt parsing assistant. Extract the total amount as a number, date in YYYY-MM-DD format, merchant name as name, and pick the best matching category_name and subcategory_name strictly from this JSON list: ' . $categoriesContext . '. Output ONLY a valid JSON object with keys: amount, date, name, category_name, subcategory_name.'
                        ],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $imageBase64
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'response_mime_type' => 'application/json'
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API Connection Failed: ' . $response->body());
            return response()->json(['error' => 'AI service connection failed.'], 500);
        }

        $responseText = $response->json('candidates.0.content.parts.0.text');
        $aiResult = json_decode($responseText, true) ?? [];

        $matchedCategoryId = null;

        if (!empty($aiResult['subcategory_name'])) {
            $subCategoryRecord = Category::where('name', $aiResult['subcategory_name'])->first();
            if ($subCategoryRecord) {
                $matchedCategoryId = $subCategoryRecord->id;
            }
        }

        if (!$matchedCategoryId && !empty($aiResult['category_name'])) {
            $mainCategoryRecord = Category::where('name', $aiResult['category_name'])->first();
            if ($mainCategoryRecord) {
                $matchedCategoryId = $mainCategoryRecord->id;
            }
        }

        return response()->json([
            'amount' => $aiResult['amount'] ?? null,
            'date' => $aiResult['date'] ?? now()->toDateString(),
            'name' => $aiResult['name'] ?? null,
            'category_name' => $aiResult['category_name'] ?? null,
            'subcategory_name' => $aiResult['subcategory_name'] ?? null,
            'category_id' => $matchedCategoryId,
        ]);
    }
}
