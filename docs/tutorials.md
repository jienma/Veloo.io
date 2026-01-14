# Getting Started Tutorial

## Part 1:Exporting content from Adobe AfterEffects

Watch the video:

<div class="video-embed ratio-16x9">
  <iframe
    src="https://www.youtube.com/embed/EHR1pU3w9y0?si=iG-SZke_POile7X5"
    title="YouTube video"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

or follow the steps below to export your Adobe After Effects project for use with **Velocity Platform**.

---

### 1. Install the Bodymovin Extension

Make sure the **Bodymovin** extension is installed in Adobe After Effects.  
You can find it in the **Creative Cloud Desktop App** under the **Plugins** section.

> 💡 Bodymovin is free to download and install.

---

![Download page of pluging in Creative Cloud Dekstop UI](images/download_bodymovin.JPG)

---

### 2. Select the Composition to Export

1. Open your AE project.  
2. Make active the **composition** you want to export in the viewport.  
3. Open the **Bodymovin panel**, and select the target composition from the list of all compositions in the project.

![Selecting a composition to export in the bodymovin plugin UI](images/select_comp_bm.JPG)

*All **nested compositions** will be handled automatically by the exporter — no additional steps are required.*

---

### 3. Configure Text Export Settings (if applicable)

If your composition contains **Text layers**, you must adjust Bodymovin’s text export settings:

1. In the Bodymovin panel, click the **Settings (gear) icon** next to the “Selected” indicator.  
2. In the pop-up settings panel, **uncheck** the first option, **“Glyphs”**, then click the **green “Save”** button.  
   - By default, Bodymovin exports text as vector shapes because the standard Lottie player does not support font files.  
   - Velocity, however, **supports font files**, and needs to know the exact font name used in each text layer.  
3. After saving, the settings panel will collapse.
4. Click the three green dots on the right of the selected composition, then choose a folder on your file system for the exporter to write the Lottie files.

![Configuring font export in the bodymovin plugin UI](images/uncheck_glyphs_bm.JPG)

**Important note regarding fonts:** Due to strict copyright regulations around font usage (including fonts that may be unlicensed or licensed under unsuitable terms and conditions), we **do not allow uploading font files**. You must use font families from the list of supported fonts provided by the platform. All fonts we provide can be downloaded for free from [Google Fonts](https://fonts.google.com/).  
[Here](fonts.md) you can find the list of all font families currently supported by Velocity Platform.
---

### 4. Export the Composition

Click the **green “Render”** button to export the composition.

> ⚠️ **Important:** If this is your first time using Bodymovin, the export may fail because After Effects blocks plugins from writing files to disk by default.  
> To enable this:
>
> - Go to **Edit → Preferences → Scripting & Expressions**  
> - Check the box **“Allow Scripts to Write Files and Access Network”**

---

### 5. Export Font Files Correctly

If your project contains text layers and you unchecked “Glyphs” in Step 3, a **Font Settings** dialog will appear during export.

For each font used:

1. In the **Font Path** field, type the **font name exactly as it appears** in the AE **Text Settings panel**.  
   - Remove spaces if the name consists of multiple words.  
   - Case sensitivity is ignored, but the spelling must be exact.
2. You do **not** need to fill in any other fields in this dialog.

![Configuring font export in the bodymovin plugin UI](images/font_export_settings_bm.JPG)

---

### 6. Zip the Exported Files

Before uploading to the API:

1. Verify the **integrity** of the exported files.  
2. Ensure all exported files from Bodymovin are contained in a **single folder**.  
3. Compress this folder into a `.zip` archive using any standard archiving tool (WinZip, 7-Zip, WinRAR, etc.).  
   - Only `.zip` format is currently supported.


![Exported project directory structure](images/exported_folder_structure.JPG)

---

### 7. Upload the Project to Your Velocity Account

Once your `.zip` file is ready, **upload it through your account dashboard or API** to begin rendering.


<br>
<br>






## Part 2:Velocity Rendering API 

This guide provides a comprehensive overview of the "Direct Render" workflow using the Velocity API.
It is designed for developers who need to programmatically upload templates, manage audio assets, and generate video renders without the overhead of campaign management.

### Base URL
All API requests should be made to:
`https://api.veloo.io` (Replace with actual API base URL)

### Authentication
Authentication is performed via the `X-API-Key` HTTP header.
```http
X-API-Key: your-api-key-here
```

---

### Workflow Overview
The Direct Render workflow consists of three main stages:
1.  **Template Management**: Uploading your After Effects template.
2.  **Audio Management** (Optional): Uploading audio assets to be used in the render.
3.  **Rendering**: Submitting a job to combine the template and audio into a final video.

---

### Step 1: Template Management

### 1.1 Upload Template
Upload your After Effects template as a ZIP file.
**Endpoint**: `POST /api/template/upload`
**Content-Type**: `multipart/form-data`

**Requirements**:
*   File must be a `.zip` archive (Max 2GB).
*   Must contain a `data.json` configuration file at the root or within a single folder.

**Example Request (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', templateFile); // templateFile is a File object

const response = await fetch('https://api.veloo.io/api/template/upload', {
  method: 'POST',
  headers: { 'X-API-Key': 'YOUR_API_KEY' },
  body: formData
});
const data = await response.json();
console.log(data.templateId);
```

**Example Request (cURL)**:
```bash
curl -X POST "https://api.veloo.io/api/template/upload" \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "file=@/path/to/your/template.zip"
```

**Success Response**:
```json
{
  "status": "uploaded",
  "templateId": "123e4567-e89b-12d3-a456-426614174001"
}
```

### 1.2 Check Template Processing Status
After uploading, you must wait for the template to be processed and validated.
**Endpoint**: `GET /api/template/{templateId}/status`

**Polling Strategy**: Poll this endpoint every 2-5 seconds until `status` is `"completed"`.

**Example Request (JavaScript)**:
```javascript
const response = await fetch(
  'https://api.veloo.io/api/template/123e4567-e89b-12d3-a456-426614174001/status',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);
const data = await response.json();
console.log(data.status); // "processing" or "completed"
```

**Example Request (cURL)**:
```bash
curl -X GET "https://api.veloo.io/api/template/123e4567-e89b-12d3-a456-426614174001/status" \
  -H "X-API-Key: YOUR_API_KEY"
```

**Response (Processing)**:
```json
{
  "templateId": "123e4567-e89b-12d3-a456-426614174001",
  "status": "processing",
  ...
}
```

**Response (Completed)**:
```json
{
  "templateId": "123e4567-e89b-12d3-a456-426614174001",
  "status": "completed",
  ...
}
```

---

### Step 2: Audio Management

If your video requires dynamic audio (e.g., background music, voiceover) that isn't embedded in the template itself, you can upload it separately.

### 2.1 Upload Audio File
Upload an MP3, WAV, or AAC file. Audio is automatically added to your default audio group.
**Endpoint**: `POST /api/audio/upload`
**Query Parameter**: `audioAssetGroupId` (Optional - uses your default group if omitted)

**Example Request (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', audioFile); // audioFile is a File object

const response = await fetch('https://api.veloo.io/api/audio/upload', {
  method: 'POST',
  headers: { 'X-API-Key': 'YOUR_API_KEY' },
  body: formData
});
const data = await response.json();
console.log(data.audioId);
```

**Example Request (cURL)**:
```bash
curl -X POST "https://api.veloo.io/api/audio/upload" \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "file=@/path/to/music.mp3"
```

**Response**:
```json
{
  "status": "uploaded",
  "audioId": "456e7890-e12b-34d5-a678-901234567001"
}
```

### 2.2 Check Audio Processing Status
Audio files must be processed (validation & conversion) before use.
**Endpoint**: `GET /api/audio/{audioId}/status`

**Polling Strategy**: Poll every 2-5 seconds until `status` is `"completed"`.

**Example Request (JavaScript)**:
```javascript
const response = await fetch(
  'https://api.veloo.io/api/audio/456e7890-e12b-34d5-a678-901234567001/status',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);
const data = await response.json();
console.log(data.status); // "processing" or "completed"
```

**Example Request (cURL)**:
```bash
curl -X GET "https://api.veloo.io/api/audio/456e7890-e12b-34d5-a678-901234567001/status" \
  -H "X-API-Key: YOUR_API_KEY"
```

---

### Step 3: Rendering

Once your `templateId` and optional `audioId` are ready (status "completed"), you can submit a render job.

### 3.1 Submit Render Job
**Endpoint**: `POST /api/render`
**Content-Type**: `application/json`

**Request Body Parameters**:
*   `templateId`: (Required) The ID of your processed template.
*   `name`: (Required) A name for this render job.
*   `audioId`: (Optional) The ID of your processed audio file.
*   `encoderConfig`: (Required) Configuration for the output video.
    *   `bitrate`: (Required) Target bitrate in bps (e.g., 5000000 for 5Mbps).
    *   `res`: (Optional) Resolution `[width, height]`.
    *   `fpsNum`: (Optional) Frame rate.

**Example Request (JavaScript)**:
```javascript
const response = await fetch('https://api.veloo.io/api/render', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'My First Direct Render',
    audioId: '456e7890-e12b-34d5-a678-901234567001',
    encoderConfig: {
      bitrate: 8000000,
      res: [1920, 1080],
      fpsNum: 30
    }
  })
});
const data = await response.json();
console.log(data.renderId);
```

**Example Request (cURL)**:
```bash
curl -X POST "https://api.veloo.io/api/render" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "123e4567-e89b-12d3-a456-426614174001",
    "name": "My First Direct Render",
    "audioId": "456e7890-e12b-34d5-a678-901234567001",
    "encoderConfig": {
        "bitrate": 8000000,
        "res": [1920, 1080],
        "fpsNum": 30
    }
  }'
```

**Response**:
```json
{
  "renderId": "999e8888-e77b-66d5-a555-443322110001",
  "status": "pending"
}
```

### 3.2 Poll Render Progress
Monitor the progress of the video generation.
**Endpoint**: `GET /api/render/{renderId}/status`

**Polling Strategy**: Poll every 5-10 seconds.
**Statuses**:
*   `pending`: Queued.
*   `processing`: Currently rendering.
*   `completed`: Finished and ready to download.
*   `failed`: Error occurred (check `reason` field).

**Example Request (JavaScript)**:
```javascript
const response = await fetch(
  'https://api.veloo.io/api/render/999e8888-e77b-66d5-a555-443322110001/status',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);
const data = await response.json();
console.log(data.status); // "pending", "processing", "completed", or "failed"
```

**Example Request (cURL)**:
```bash
curl -X GET "https://api.veloo.io/api/render/999e8888-e77b-66d5-a555-443322110001/status" \
  -H "X-API-Key: YOUR_API_KEY"
```

### 3.3 Download Rendered Video
When the status is `"completed"`, you can download the final MP4 file.
**Endpoint**: `GET /api/render/{renderId}/download`

**Example Request (JavaScript)**:
```javascript
const response = await fetch(
  'https://api.veloo.io/api/render/999e8888-e77b-66d5-a555-443322110001/download',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'video.mp4';
a.click();
```

**Example Request (cURL)**:
```bash
curl -X GET "https://api.veloo.io/api/render/999e8888-e77b-66d5-a555-443322110001/download" \
  -H "X-API-Key: YOUR_API_KEY" \
  -o "final_video.mp4"
```

### Summary of IDs
| ID Name | Source Endpoint | Used In |
| :--- | :--- | :--- |
| **Template ID** | `POST /api/template/upload` | `POST /api/render` (as `templateId`) |
| **Audio ID** | `POST /api/audio/upload` | `POST /api/render` (as `audioId`) |
| **Render ID** | `POST /api/render` | `GET /api/render/{id}/status` & `download` |