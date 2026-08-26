<?php

use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/home', [PageController::class, 'home']);
Route::get('/home/about', [PageController::class, 'home'])->name('about');

Route::get('/big-bang', [PageController::class, 'bigBang'])->name('big-bang');

Route::get('/services', [PageController::class, 'services'])->name('services');
Route::get('/services/{slug}', [PageController::class, 'service'])->name('service');

Route::get('/portfolio', [PageController::class, 'portfolio'])->name('portfolio');
Route::get('/project/{slug}', [PageController::class, 'project'])->name('project');

Route::get('/case-studies', [PageController::class, 'caseStudies'])->name('case-studies');
Route::get('/case-study/{slug}', [PageController::class, 'caseStudy'])->name('case-study');

Route::get('/blog', [PageController::class, 'blog'])->name('blog');
Route::get('/post/{slug}', [PageController::class, 'post'])->name('post');

Route::get('/contact-us', [PageController::class, 'contact'])->name('contact');
Route::post('/contact-us', [PageController::class, 'lead'])->name('lead');
