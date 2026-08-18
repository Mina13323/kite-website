<?php

namespace Tests\Feature;

use Tests\TestCase;

class StudioPhpEditorTest extends TestCase
{
    public function test_studio_editor_requires_a_studio_session(): void
    {
        $this->get('/studio')->assertRedirect('/studio/login');
        $this->get('/studio/projects')->assertRedirect('/studio/login');
    }

    public function test_all_hostinger_editor_sections_render_without_blade_views(): void
    {
        config(['view.paths' => [base_path('tests/fixtures/no-blade-views')]]);

        foreach (['/studio', '/studio/homepage', '/studio/projects', '/studio/services', '/studio/clients', '/studio/media', '/studio/contact'] as $path) {
            $this->withSession(['kite_studio' => true])->get($path)->assertOk();
        }

        $this->withSession(['kite_studio' => true])->get('/studio')
            ->assertSee('Website content')
            ->assertSee('Clients / Kites')
            ->assertSee('Contact &amp; SEO', false)
            ->assertSee('Sign out');
    }

    public function test_login_page_contains_a_csrf_protected_form(): void
    {
        $this->get('/studio/login')
            ->assertOk()
            ->assertSee('name="_token"', false)
            ->assertSee('Enter Studio');
    }
}
