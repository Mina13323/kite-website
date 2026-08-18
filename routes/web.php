<?php

use App\Http\Controllers\SiteController;
use App\Http\Controllers\Studio\AuthController;
use App\Http\Controllers\Studio\DashboardController;
use App\Http\Controllers\Studio\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home']);
Route::get('/home', [SiteController::class, 'home']);
Route::get('/home/about', [SiteController::class, 'home']);
Route::get('/services', [SiteController::class, 'services']);
Route::get('/services/{slug}', [SiteController::class, 'service']);
Route::get('/portfolio', [SiteController::class, 'portfolio']);
Route::get('/case-studies', [SiteController::class, 'caseStudies']);
Route::get('/case-study/{slug}', [SiteController::class, 'caseStudy']);
Route::get('/project/{slug}', [SiteController::class, 'project']);
Route::get('/contact-us', [SiteController::class, 'contact']);

Route::get('/studio/login', [AuthController::class, 'create'])->name('studio.login');
Route::post('/studio/login', [AuthController::class, 'store'])->name('studio.login.store');

Route::middleware(['auth', 'studio'])->prefix('studio')->name('studio.')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::post('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::post('/projects/{project}/upload', [ProjectController::class, 'upload'])->name('projects.upload');
    Route::post('/projects/{project}/media', [ProjectController::class, 'removeMedia'])->name('projects.media.remove');
});
