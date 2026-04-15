<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 20);

        if (! in_array($perPage, [20, 50, 100], true)) {
            $perPage = 20;
        }

        $categories = Category::query()
            ->withCount('assets')
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search'),
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validatedData($request);

        $redirectTo = $request->string('redirect_to')->toString();
        if ($redirectTo === '' || ! str_starts_with($redirectTo, '/')) {
            $redirectTo = route('categories.index');
        }

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter++;
        }

        $validated['slug'] = $slug;

        $category = Category::create($validated);

        return redirect()->to($redirectTo)->with('createdCategory', [
            'id' => $category->id,
            'name' => $category->name,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $this->validatedData($request);

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
            $slug = $baseSlug.'-'.$counter++;
        }

        $validated['slug'] = $slug;

        $category->update($validated);

        return redirect()->route('categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Delete the category and redirect back to the index.
        $category->delete();

        return redirect()->route('categories.index');
    }

    /**
     * Validate and normalize category input.
     *
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        $description = $request->input('description');
        $hexColor = $request->input('hex_color');

        $request->merge([
            'name' => trim((string) $request->input('name', '')),
            'description' => is_string($description) ? trim($description) ?: null : null,
            'hex_color' => is_string($hexColor) ? trim($hexColor) ?: null : null,
        ]);

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'hex_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);
    }
}
