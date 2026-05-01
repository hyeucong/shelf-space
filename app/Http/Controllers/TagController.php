<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $perPage = $request->integer('per_page', 20);

        $allowedSorts = ['name', 'created_at'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }

        if (!in_array($perPage, [20, 50, 100], true)) {
            $perPage = 20;
        }

        $order = in_array(strtolower($order), ['asc', 'desc']) ? $order : 'desc';

        $tags = $request->user()->tags()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount('assets')
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('tags/index', [
            'tags' => $tags,
            'filters' => [
                'search' => $request->input('search'),
                'per_page' => $perPage,
                'sort' => $sort,
                'order' => $order,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $redirectTo = $request->string('redirect_to')->toString();
        if ($redirectTo === '' || ! str_starts_with($redirectTo, '/')) {
            $redirectTo = route('tags.index');
        }

        $validated = $this->validatedData($request);
        $validated['user_id'] = $request->user()->id;

        $tag = Tag::create($validated);

        return redirect()->to($redirectTo)->with('success', 'Tag created successfully.')->with('createdTag', [
            'id' => $tag->id,
            'name' => $tag->name,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        $tag->update($this->validatedData($request, $tag));

        return redirect()->route('tags.index')->with('success', 'Tag updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->route('tags.index')->with('success', 'Tag deleted successfully.');
    }

    /**
     * Validate and normalize tag input.
     *
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?Tag $tag = null): array
    {
        $request->merge([
            'name' => trim((string) $request->input('name', '')),
        ]);

        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tags', 'name')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                    ->ignore($tag?->id),
            ],
            'description' => ['nullable', 'string'],
            'hex_color' => ['nullable', 'string', 'max:7'],
        ]);
    }
}
