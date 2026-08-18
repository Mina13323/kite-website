# Hostinger shared-hosting Studio overlay

The PHP Studio renders its own HTML and does not require Blade views or a writable `storage/framework/views` cache.

## Two-file overlay

Upload these two files to the same paths in the Hostinger Laravel application:

1. `app/Http/Controllers/Studio/ContentController.php`
2. `app/Support/Website/StudioUi.php`

The current deployed branch must already include the existing Studio routes, authentication middleware, `CmsStore`, CSS, and JavaScript assets. This overlay does not change the public website.

**Do not overwrite or delete `storage/app/website/cms.json`.** It contains the live website edits.

The renderer creates these runtime directories when they are missing:

- `storage/framework/views`
- `storage/framework/sessions`
- `storage/framework/cache/data`
- `storage/logs`
- `public/uploads/website`

Keep these production environment values:

```dotenv
SESSION_DRIVER=file
CACHE_STORE=file
```

After uploading, sign in at `/studio/login`, then confirm `/studio` and every left-navigation editor page returns HTML. Ensure PHP can write to `storage/` and `public/uploads/website/`.
