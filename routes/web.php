<?php

use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home']);
Route::get('/home', [SiteController::class, 'home']);
Route::get('/home/about', [SiteController::class, 'home']);

Route::get('/big-bang', fn () => app(SiteController::class)->view('big-bang', 'Big Bang · MWG'));
Route::get('/services', fn () => app(SiteController::class)->view('services', 'Services · MWG'));
Route::get('/portfolio', fn () => app(SiteController::class)->view('portfolio', 'Portfolio · MWG'));
Route::get('/case-studies', fn () => app(SiteController::class)->view('case-studies', 'Case Studies · MWG'));
Route::get('/blog', fn () => app(SiteController::class)->view('blog', 'The Big Bang Log · MWG'));
Route::get('/contact-us', fn () => app(SiteController::class)->view('contact', 'Contact Us · MWG'));

Route::get('/services/{slug}', [SiteController::class, 'service']);

Route::get('/project/{slug}', function (string $slug) {
    return app(SiteController::class)->fallback(
        str_replace('-', ' ', $slug),
        'Project detail — customize this copy in resources/site/content.js and the Node preview, or extend SiteController.',
        '/assets/images/hero.jpg'
    );
});

Route::get('/case-study/{slug}', function (string $slug) {
    return app(SiteController::class)->fallback(
        str_replace('-', ' ', $slug),
        'Case study — swap this for your own write-up after the clone.',
        '/assets/images/projects/naguib-selim.jpg'
    );
});

Route::get('/post/{slug}', function (string $slug) {
    return app(SiteController::class)->fallback(
        str_replace('-', ' ', $slug),
        'Blog article starter. Replace with your own posts when you rebrand the site.',
        '/assets/images/blog/01.jpg'
    );
});
