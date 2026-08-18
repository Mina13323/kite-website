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

    public function test_all_hostinger_editor_sections_render_for_an_authenticated_editor(): void
    {
        foreach (['/studio', '/studio/homepage', '/studio/projects', '/studio/services', '/studio/clients', '/studio/media', '/studio/contact'] as $path) {
            $this->withSession(['kite_studio' => true])->get($path)->assertOk();
        }
    }

    public function test_login_page_contains_a_csrf_protected_form(): void
    {
        $this->get('/studio/login')
            ->assertOk()
            ->assertSee('name="_token"', false)
            ->assertSee('Enter Studio');
    }
}
