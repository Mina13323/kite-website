<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Models\Website\Industry;
use App\Models\Website\Project;
use App\Models\Website\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class ProjectController extends Controller
{
    public function index(): View
    {
        return view('studio.projects.index', [
            'projects' => Project::query()->with('industry')->orderBy('title')->get(),
        ]);
    }

    public function edit(Project $project): View
    {
        return view('studio.projects.edit', [
            'project' => $project->load('services'),
            'industries' => Industry::query()->orderBy('sort_order')->get(),
            'services' => Service::query()->orderBy('sort_order')->get(),
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'client' => ['nullable', 'string', 'max:255'],
            'website_industry_id' => ['nullable', 'exists:website_industries,id'],
            'short_description' => ['nullable', 'string'],
            'full_description' => ['nullable', 'string'],
            'year' => ['nullable', 'string', 'max:20'],
            'challenge' => ['nullable', 'string'],
            'approach' => ['nullable', 'string'],
            'execution' => ['nullable', 'string'],
            'results' => ['nullable', 'string'],
            'credits' => ['nullable', 'string'],
            'external_url' => ['nullable', 'url'],
            'website_preview_type' => ['nullable', 'in:iframe,image'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'featured' => ['sometimes', 'boolean'],
            'services' => ['array'],
            'services.*' => ['exists:website_services,id'],
        ]);

        if (($data['status'] ?? null) === 'published' && ! $project->published_at) {
            $data['published_at'] = now();
        }

        $data['featured'] = $request->boolean('featured');
        $data['manually_edited'] = true;

        $project->update($data);
        $project->services()->sync($request->input('services', []));

        return back()->with('status', 'Saved.');
    }

    public function upload(Request $request, Project $project): RedirectResponse
    {
        $request->validate([
            'field' => ['required', 'in:hero_image,cover_image,thumbnail,mobile_image,website_preview_image,og_image,gallery'],
            'image' => ['required', 'image', 'max:8192'],
        ]);

        $field = $request->string('field')->toString();
        $path = $request->file('image')->store('website/'.$project->slug, 'public');

        if ($field === 'gallery') {
            $gallery = $project->gallery ?? [];
            $gallery[] = ['id' => uniqid(), 'url' => Storage::disk('public')->url($path)];
            $project->update(['gallery' => $gallery, 'manually_edited' => true]);
        } else {
            $project->update([$field => Storage::disk('public')->url($path), 'manually_edited' => true]);
        }

        return back()->with('status', 'Image uploaded.');
    }

    public function removeMedia(Request $request, Project $project): RedirectResponse
    {
        $request->validate([
            'field' => ['required', 'in:hero_image,cover_image,thumbnail,mobile_image,website_preview_image,og_image,gallery'],
            'id' => ['nullable', 'string'],
        ]);

        $field = $request->string('field')->toString();

        if ($field === 'gallery') {
            $gallery = collect($project->gallery ?? [])
                ->reject(fn ($item) => ($item['id'] ?? null) === $request->string('id')->toString())
                ->values()
                ->all();
            $project->update(['gallery' => $gallery, 'manually_edited' => true]);
        } else {
            $project->update([$field => null, 'manually_edited' => true]);
        }

        return back()->with('status', 'Image removed.');
    }
}
