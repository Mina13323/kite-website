<?php

namespace App\Providers;

use App\Support\SiteData;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SiteData::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Site content (nav, social links, brand) is available to every view.
        View::share('site', $this->app->make(SiteData::class));
    }
}
