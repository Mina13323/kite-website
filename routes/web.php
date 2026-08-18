<?php

use App\Http\Controllers\SiteController;
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
Route::post('/studio/login', [StudioGatewayController::class, 'authenticate'])->name('studio.login.store');
Route::post('/studio/logout', [StudioGatewayController::class, 'logout'])->name('studio.logout');
Route::get('/studio', [StudioGatewayController::class, 'dashboard'])->name('studio.dashboard');
Route::any('/studio/{path}', [StudioGatewayController::class, 'unavailable'])->where('path', '.*');
