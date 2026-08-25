<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Category;
use App\Models\Expense;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::with('category.parent')
            ->where('user_id', auth()->id())
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');
        $categories = Category::whereNull('parent_id')->with('subcategories')->get();

        return Inertia::render('Expenses/Index', ['expenses' => $expenses, 'categories' => $categories]);
    }

    public function create()
    {
        $categories = Category::whereNull('parent_id')->with('subcategories')->get();
        return Inertia::render('Expenses/Create', ['categories' => $categories]);
    }

    public function store(ExpenseRequest $request)
    {
//        dd($request->all());
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'in:cash,card',
            'type' => 'in:expense,income',
            'name' => 'nullable|string|max:255',
            'date' => 'required|date',
            'currency' => 'nullable|string|max:10',
        ]);

        $validated['user_id'] = auth()->id();

        Expense::create($validated);

        return redirect()->route('expenses.index');
    }

    public function show(Expense $expense)
    {
        return Inertia::render('Expenses/Show', ['expense' => $expense]);
    }

    public function edit(Expense $expense)
    {
        $categories = Category::whereNull('parent_id')->with('subcategories')->get();
        return Inertia::render('Expenses/Edit', ['expense' => $expense, 'categories' => $categories]);
    }

    public function update(ExpenseRequest $request, Expense $expense)
    {
        $expense->update($request->validated());

        return redirect()->route('expenses.index');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return redirect()->route('expenses.index');
    }
}
