<?php

use App\Http\Controllers\SiteController;
use App\Http\Controllers\Studio\ContentController;
use App\Http\Controllers\Studio\StudioGatewayController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home']);
Route::get('/home', [SiteController::class, 'home']);
Route::get('/home/about', [SiteController::class, 'home']);
Route::get('/services', [SiteController::class, 'services']);
Route::get('/services/{slug}', [SiteController::class, 'service']);
Route::get('/about', fn () => redirect('/home#about'));
Route::get('/projects', fn () => redirect('/portfolio'));
Route::get('/portfolio', [SiteController::class, 'portfolio']);
Route::get('/sitemap.xml', [SiteController::class, 'sitemap']);
Route::get('/robots.txt', [SiteController::class, 'robots']);
Route::get('/favicon.ico', [SiteController::class, 'favicon']);
Route::get('/case-studies', [SiteController::class, 'caseStudies']);
Route::get('/case-studies/{slug}', [SiteController::class, 'caseStudy']);
Route::get('/case-study/{slug}', [SiteController::class, 'caseStudy']);
Route::get('/project/{slug}', [SiteController::class, 'project']);
Route::get('/contact-us', [SiteController::class, 'contact']);
Route::post('/contact-us', [SiteController::class, 'submitContact']);
Route::get('/big-bang', fn () => redirect('/portfolio'));
Route::get('/blog', fn () => redirect('/home'));
Route::get('/post/{slug}', fn () => redirect('/home'));

Route::get('/studio/login', [StudioGatewayController::class, 'login'])->name('studio.login');
Route::post('/studio/login', [StudioGatewayController::class, 'authenticate'])->name('studio.login.store')->middleware('throttle:10,1');
Route::middleware('studio.session')->prefix('studio')->name('studio.')->group(function () {
    Route::post('/logout', [StudioGatewayController::class, 'logout'])->name('logout');
    Route::get('/', [ContentController::class, 'dashboard'])->name('dashboard');

    Route::get('/homepage', [ContentController::class, 'homepage'])->name('homepage');
    Route::post('/homepage', [ContentController::class, 'saveHomepage'])->name('homepage.save');

    Route::get('/projects', [ContentController::class, 'projects'])->name('projects');
    Route::get('/projects/new', [ContentController::class, 'project'])->name('projects.new');
    Route::post('/projects/new', [ContentController::class, 'saveProject'])->name('projects.create');
    Route::get('/projects/{slug}', [ContentController::class, 'project'])->name('projects.edit');
    Route::post('/projects/{slug}', [ContentController::class, 'saveProject'])->name('projects.update');
    Route::post('/projects/{slug}/delete', [ContentController::class, 'deleteProject'])->name('projects.delete');

    Route::get('/services', [ContentController::class, 'services'])->name('services');
    Route::post('/services/reorder', [ContentController::class, 'reorderServices'])->name('services.reorder');
    Route::get('/services/new', [ContentController::class, 'service'])->name('services.new');
    Route::post('/services/new', [ContentController::class, 'saveService'])->name('services.create');
    Route::get('/services/{slug}', [ContentController::class, 'service'])->name('services.edit');
    Route::post('/services/{slug}', [ContentController::class, 'saveService'])->name('services.update');

    Route::get('/clients', [ContentController::class, 'clients'])->name('clients');
    Route::get('/clients/new', [ContentController::class, 'client'])->name('clients.new');
    Route::post('/clients/new', [ContentController::class, 'saveClient'])->name('clients.create');
    Route::get('/clients/{slug}', [ContentController::class, 'client'])->name('clients.edit');
    Route::post('/clients/{slug}', [ContentController::class, 'saveClient'])->name('clients.update');
    Route::post('/clients/{slug}/delete', [ContentController::class, 'deleteClient'])->name('clients.delete');

    Route::get('/media', [ContentController::class, 'media'])->name('media');
    Route::post('/media', [ContentController::class, 'uploadMedia'])->name('media.upload');
    Route::post('/media/{id}/delete', [ContentController::class, 'deleteMedia'])->name('media.delete');

    Route::get('/contact', [ContentController::class, 'contact'])->name('contact');
    Route::post('/contact', [ContentController::class, 'saveContact'])->name('contact.save');
});
