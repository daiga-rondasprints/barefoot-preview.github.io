# Media manifests

Index files for media batches living in S3 (`s3://barefoot-baltic-media/`).

Each manifest describes one tour/shoot/batch:
- `bucket`, `region`, `base_url` — where to fetch from
- `groups` — subject clusters with counts and alt text (use this to pick which subject to pull from)
- `items[]` — every file with `slug`, `seq`, `alt`, `capture_ts`, `original_filename`, S3 keys

## Picking a photo for a page

1. Find the cluster in `groups` (e.g. `turaida-castle-red-brick-tower` — 12 shots, all with the same alt template).
2. Filter `items` where `slug == "<that-slug>"` to get the individual shots; pick by `seq` or by reviewing thumbnails.
3. Build the URL: `<base_url>/<s3_key_jpg>` for JPG, `<s3_key_webp>` for WebP.
4. Reference in HTML using the standard `<picture>` pattern:

```html
<picture>
  <source srcset="https://barefoot-baltic-media.s3.eu-north-1.amazonaws.com/sigulda-tour-2026-05/web/webp/turaida-castle-red-brick-tower-03.webp" type="image/webp">
  <img src="https://barefoot-baltic-media.s3.eu-north-1.amazonaws.com/sigulda-tour-2026-05/web/jpg/turaida-castle-red-brick-tower-03.jpg"
       alt="Turaida red brick castle tower, Sigulda, Latvia"
       width="2400" height="1800" loading="lazy">
</picture>
```

## Layout in S3

```
s3://barefoot-baltic-media/<batch>/
├── manifest.json                          ← matches the file in this dir
├── originals/photo/<slug>-NN.{heic,jpg}   ← originals (public-readable for download links)
├── originals/video/<slug>-NN.mov          ← raw videos (PRIVATE — pull manually for YouTube)
├── web/jpg/<slug>-NN.jpg                  ← max 2400px, q85, public, immutable cache
└── web/webp/<slug>-NN.webp                ← q82, public, immutable cache
```

## Adding a new batch

1. Drop renamed files into a folder with a `_rename_plan.csv` (the rename tooling lives at `<download>/Sigulda full-3-001/_work/`).
2. Run `pipeline_parallel.py` to convert HEIC/JPG → web JPG+WebP.
3. Run `upload.py` to push originals + web versions + manifest to S3.
4. Copy `staged/manifest.json` into `_assets/media-manifests/<batch>.json`.
5. Commit the manifest copy (NOT the media — those live in S3 only).

## Why a CDN later

Direct S3 (`barefoot-baltic-media.s3.eu-north-1.amazonaws.com/...`) works today.
Switching to CloudFront + `cdn.barefootbaltic.com` is a one-line edit: change `base_url` in each manifest. URLs remain stable because we use bucket-relative S3 keys.
