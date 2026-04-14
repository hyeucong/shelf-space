<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        $allowedSorts = ['event', 'created_at'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }

        $order = in_array(strtolower($order), ['asc', 'desc']) ? $order : 'desc';

        $audits = Audit::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('event', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy($sort, $order)
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('audits/index', [
            'audits' => $audits,
            'filters' => $request->only(['search', 'per_page', 'sort', 'order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('audits/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Audit $audit)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Audit $audit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Audit $audit)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Audit $audit)
    {
        //
    }
}
