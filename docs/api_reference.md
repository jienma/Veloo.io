# Velocity Simple API

**Version:** v1

Direct Template Rendering API

This simplified API enables direct video rendering from templates using only API key authentication.

---

## Quick Start

1. Obtain your API key from admin
2. Add `X-API-Key` header to all requests
3. Upload a template ZIP via `POST /template/upload`
4. Wait for processing (poll `GET /template/{id}/status`)
5. Create render with `POST /render` (use templateId field)
6. Download video when complete

---

## Authentication

**API Key only** - include `X-API-Key` header in all requests.

```
X-API-Key: your-api-key-here
```

---

# Template Endpoints

## POST /Template/upload

**Upload a template as a ZIP file for processing and validation.**

Upload your template packaged as a ZIP file. The system will validate the template structure, verify assets, and prepare it for video rendering.

### How to use
1. Package your JSON configuration and all assets (images, videos) into a ZIP file
2. Include `X-API-Key` header with your API key
3. Send multipart/form-data POST request with the file
4. Receive template ID and monitor processing status

### Template Requirements
- **File format:** ZIP only
- **Max compressed size:** 2GB
- **Must contain:** At least one JSON configuration file (e.g., data.json)
- **Supported images:** PNG, JPG, JPEG, GIF, TGA
- **Supported videos:** MP4 (H.264/H.265 codec only)
- **Supported audio:** MP3, WAV, AAC (uploaded via Audio API)

### Request Body
Multipart/form-data with `file` field containing the ZIP binary.

### Responses

| Code | Description |
|------|-------------|
| 200 | Template uploaded successfully and processing started |
| 400 | Invalid file format, missing required files, or quota exceeded |
| 401 | Missing or invalid API key |
| 413 | File size exceeds maximum allowed (2GB) |

### Example usage

[code-tabs: cURL, JS (Fetch), JS (Axios)]
```bash
# cURL
curl -X POST https://api.veloo.io/template/upload \
  -H "X-API-Key: your-api-key" \
  -F "file=@template.zip"
```
```javascript
// JavaScript (Fetch)
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://api.veloo.io/template/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key'
  },
  body: formData
});

const data = await response.json();
console.log(data.templateId);
```
```javascript
// JavaScript (Axios)
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await axios.post('https://api.veloo.io/template/upload', formData, {
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'multipart/form-data'
  }
});

console.log(response.data.templateId);
```

### Example Response

```json
{
  "status": "uploaded",
  "templateId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Next steps
- Use `GET /template/{templateId}/status` to monitor processing
- Once status is "completed", template is ready for rendering

---

## GET /Template/all

**Retrieve all successfully processed templates owned by the current user.**

Returns a list of all templates that have been successfully validated and are ready for rendering. Does not include templates currently processing or that failed validation.

### Responses

| Code | Description |
|------|-------------|
| 200 | Templates retrieved successfully |
| 401 | Missing or invalid API key |

### Returns for each template
- Template ID (use for rendering)
- Template name
- File size in bytes
- Upload timestamp

### Example Response

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Product Promo",
    "sizeBytes": 52428800,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## GET /Template/active

**Retrieve all templates currently being processed (validation, extraction, analysis).**

Shows templates that are currently being validated and processed, but not yet ready for rendering.

### Processing stages
1. **Uploaded** - File received, queued for processing
2. **Validating** - Checking file structure and requirements
3. **Extracting** - Extracting ZIP contents and validating assets
4. **Analyzing** - Verifying configuration and asset references

### Responses

| Code | Description |
|------|-------------|
| 200 | Active jobs retrieved successfully |
| 401 | Missing or invalid API key |

**Typical processing time:** 30 seconds to 2 minutes depending on template complexity

---

## GET /Template/history

**Retrieve template processing history including completed and failed uploads.**

Returns historical records of all template processing jobs, useful for tracking uploads and diagnosing failures.

### Parameters

| Name | In | Type | Required | Default | Description |
|------|-----|------|----------|---------|-------------|
| `status` | query | string | No | - | "completed" or "failed" |
| `skip` | query | int32 | No | 0 | Pagination offset |
| `take` | query | int32 | No | 50 | Number of results (max: 100) |

### Common failure reasons
- Missing required JSON configuration file
- Invalid or corrupt ZIP file
- Invalid JSON structure
- Missing required assets referenced in configuration
- Unsupported file formats or codecs
- Storage quota exceeded

### Responses

| Code | Description |
|------|-------------|
| 200 | History retrieved successfully |
| 401 | Missing or invalid API key |

### Example Request
```
GET /template/history?status=failed&skip=0&take=20
```

---

## GET /Template/{templateId}/download

**Download the original template ZIP file.**

Retrieve the original ZIP file that was uploaded for this template.

### Use cases
- Backup template files locally
- Re-use template for modifications
- Verify uploaded content

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `templateId` | path | string | Yes | Unique identifier of the template |

### Responses

| Code | Description |
|------|-------------|
| 200 | File download started successfully |
| 404 | Template not found or not owned by current user |
| 401 | Missing or invalid API key |

> **Note:** Downloaded file is identical to the original upload

---

## DELETE /Template/{templateId}

**Permanently delete a template and all associated data.**

Removes the template file from storage and deletes all metadata. This action cannot be undone.

### What gets deleted
- Original template ZIP file
- Extracted assets and configuration files
- Processing history records

### What is NOT deleted
- Renders created from this template (they remain available)

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `templateId` | path | string | Yes | Unique identifier of the template to delete |

### Responses

| Code | Description |
|------|-------------|
| 200 | Template deleted successfully |
| 404 | Template not found or not owned by current user |
| 400 | Template cannot be deleted (e.g., has active jobs) |
| 401 | Missing or invalid API key |

> **Warning:** Cannot delete templates with active render jobs. Cancel renders first.

---

## GET /Template/storage-status

**Check current storage quota and usage statistics.**

Returns detailed information about storage allocation and current usage.

### Responses

| Code | Description |
|------|-------------|
| 200 | Storage status retrieved successfully |
| 401 | Missing or invalid API key |

### Example Response

```json
{
  "quotaMB": 5000,
  "usedBytes": 1310720000,
  "availableBytes": 3932160000,
  "usagePercentage": 25.0
}
```

### Use cases
- Check available space before uploading
- Monitor quota consumption
- Determine if cleanup is needed

> **Note:** Contact admin to increase storage quota if needed

---

## GET /Template/{templateId}/status

**Get real-time processing status for a specific template upload job.**

Poll this endpoint to monitor template processing progress after upload.

### Processing stages and expected status values
1. **"pending"** - Upload received, queued for processing
2. **"processing"** - Actively being validated and extracted (30-120 seconds)
3. **"completed"** - Ready for rendering
4. **"failed"** - Processing failed (see error message)

### How to use
1. Upload template via `POST /template/upload`
2. Receive template ID in response
3. Poll this endpoint every 2-5 seconds until status is "completed"
4. Once completed, template is ready for rendering

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `templateId` | path | uuid | Yes | UUID of the template processing job |

### Responses

| Code | Description |
|------|-------------|
| 200 | Status retrieved successfully |
| 404 | Template job not found or not owned by current user |
| 401 | Missing or invalid API key |

### Examples

[code-tabs: cURL, JS (Fetch), JS (Axios)]
```bash
# cURL
curl -H "X-API-Key: your-api-key" \
  https://api.veloo.io/template/{templateId}/status
```
```javascript
// JavaScript (Fetch)
const templateId = 'your-template-id';
const response = await fetch(`https://api.veloo.io/template/${templateId}/status`, {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

const data = await response.json();
console.log(data.status); // "pending", "processing", "completed", "failed"
```
```javascript
// JavaScript (Axios)
const templateId = 'your-template-id';
const response = await axios.get(`https://api.veloo.io/template/${templateId}/status`, {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

console.log(response.data.status);
```

### Example Response (completed)

```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "templateId": "456e7890-e12b-34d5-a678-901234567000",
  "templateName": "Product Promo",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:45Z",
  "reason": null
}
```

### Example Response (failed)

```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "templateId": "456e7890-e12b-34d5-a678-901234567000",
  "templateName": "Product Promo",
  "status": "failed",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:15Z",
  "reason": "Missing After Effects project file in ZIP"
}
```

---

# Audio Endpoints

## GET /Audio/{audioId}

**Get audio file details by ID.**

Retrieve detailed information about a specific audio file.

### Use cases
- Get audio metadata before downloading
- Verify audio details before using in render
- Check file size and creation date
- Confirm audio is associated with expected audio asset group

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `audioId` | path | uuid | Yes | Audio ID |

### Responses

| Code | Description |
|------|-------------|
| 200 | Audio details retrieved successfully |
| 404 | Audio not found |
| 401 | Missing or invalid API key |

### Example Response (200)

```json
{
  "id": "456e7890-e12b-34d5-a678-901234567000",
  "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "background_music.mp3",
  "sizeBytes": 5242880,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

> **Note:** Only works for successfully processed audio. For audio still processing, use `GET /audio/{audioId}/status`

---

## DELETE /Audio/{audioId}

**Delete an audio file.**

Permanently delete an audio file and its associated storage. This action cannot be undone.

### Use cases
- Remove outdated or unused audio files
- Free up storage quota
- Clean up test audio uploads
- Remove incorrect audio before re-uploading

### What gets deleted
- Original audio file from storage
- Audio metadata and configuration
- Processing job history records

### What is NOT deleted
- Renders that used this audio (they remain available with audio embedded)
- The audio asset group the audio belonged to

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `audioId` | path | uuid | Yes | Audio ID to delete |

### Responses

| Code | Description |
|------|-------------|
| 200 | Audio deleted successfully |
| 400 | Audio cannot be deleted (e.g., active render jobs) |
| 404 | Audio not found |
| 401 | Missing or invalid API key |

### Example Response (200)

```json
{
  "message": "Audio deleted successfully"
}
```

> **Important:** Cannot delete audio while render jobs using it are in progress (cancel renders first). Download audio before deleting if you need to keep it.

---

## GET /Audio/{audioId}/status

**Get processing status for an audio upload.**

Poll this endpoint to monitor audio processing progress after upload.

### Processing stages

1. **"processing"** - Upload received, validation in progress (5-30 seconds)
2. **"completed"** - Ready for use in renders
3. **"failed"** - Processing failed (see reason)

### How to use

1. Upload audio via `POST /audio/upload`
2. Receive audio ID in response
3. Poll this endpoint every 2-5 seconds until status is "completed" or "failed"
4. Once completed, audio is ready for rendering

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `audioId` | path | uuid | Yes | Audio ID to check status for |

### Responses

| Code | Description |
|------|-------------|
| 200 | Status retrieved successfully |
| 404 | Audio not found |
| 401 | Missing or invalid API key |

### Example Response (processing)

```json
{
  "jobId": "789a0123-b45c-67d8-e901-234567890000",
  "audioId": "456e7890-e12b-34d5-a678-901234567000",
  "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
  "audioName": "background_music.mp3",
  "status": "processing",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": null,
  "reason": null
}
```

### Example Response (completed)

```json
{
  "jobId": "789a0123-b45c-67d8-e901-234567890000",
  "audioId": "456e7890-e12b-34d5-a678-901234567000",
  "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
  "audioName": "background_music.mp3",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:15Z",
  "reason": null
}
```

### Example Response (failed)

```json
{
  "jobId": "789a0123-b45c-67d8-e901-234567890000",
  "audioId": "456e7890-e12b-34d5-a678-901234567000",
  "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
  "audioName": "corrupted_audio.aac",
  "status": "failed",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:05Z",
  "reason": "Unsupported audio codec"
}
```

---

## GET /Audio/{audioId}/download

**Download the original audio file.**

Stream the audio file directly to your client in the original format it was uploaded.

### Use cases
- Backup audio files locally
- Verify uploaded audio content
- Re-use audio in other renders
- Preview audio before using in render

### How to use

1. Get the audio ID from `GET /audio/list` or upload response
2. Verify audio status is "completed" via `GET /audio/{audioId}/status`
3. Send GET request to this endpoint
4. Receive audio file stream with appropriate content type

### Response
- **Content-Type:** audio/mpeg (MP3), audio/wav (WAV), or audio/aac (AAC) based on original format
- **Content-Disposition:** attachment with original filename
- File streamed directly (no buffering required)

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `audioId` | path | uuid | Yes | Audio ID |

### Responses

| Code | Description |
|------|-------------|
| 200 | File download started |
| 404 | Audio not found |
| 401 | Missing or invalid API key |

### Examples

[code-tabs: cURL, JS (Fetch), JS (Axios)]
```bash
# cURL
curl -H "X-API-Key: your-api-key" \
  -o audio.mp3 \
  https://api.veloo.io/audio/{audioId}/download
```
```javascript
// JavaScript (Fetch)
const audioId = 'your-audio-id';
const response = await fetch(`https://api.veloo.io/audio/${audioId}/download`, {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'audio.mp3';
a.click();
```
```javascript
// JavaScript (Axios)
const audioId = 'your-audio-id';
const response = await axios.get(`https://api.veloo.io/audio/${audioId}/download`, {
  headers: {
    'X-API-Key': 'your-api-key'
  },
  responseType: 'blob'
});

const url = window.URL.createObjectURL(new Blob([response.data]));
const a = document.createElement('a');
a.href = url;
a.download = 'audio.mp3';
a.click();
```

---

## GET /Audio/active

**Get active audio processing jobs for the current user.**

Returns a list of audio uploads currently being processed.

### Use cases
- Monitor current audio upload queue
- Check if audio uploads are being processed
- Track active processing jobs
- Verify uploads are progressing

### Responses

| Code | Description |
|------|-------------|
| 200 | Active jobs retrieved successfully |
| 401 | Missing or invalid API key |

### Example Response

```json
[
  {
    "jobId": "789a0123-b45c-67d8-e901-234567890000",
    "audioId": "456e7890-e12b-34d5-a678-901234567000",
    "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
    "audioName": "background_music.mp3",
    "status": "processing",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": null,
    "reason": null
  }
]
```

> **Note:** Completed and failed jobs are not included. Use `GET /audio/history` for those.

---

## GET /Audio/history

**Get audio processing history for the current user.**

Returns historical records of audio processing jobs including completed and failed uploads.

### Use cases
- Review past audio uploads
- Troubleshoot failed uploads
- Track upload success rates
- Audit audio processing history

### Parameters

| Name | In | Type | Required | Default | Description |
|------|-----|------|----------|---------|-------------|
| `status` | query | string | No | - | Filter: "completed" or "failed" |
| `skip` | query | int32 | No | 0 | Pagination offset |
| `take` | query | int32 | No | 50 | Number of results (max: 100) |

### Responses

| Code | Description |
|------|-------------|
| 200 | History retrieved successfully |
| 401 | Missing or invalid API key |

### Example Request
```
GET /audio/history?status=failed&skip=0&take=20
```

### Example Response

```json
[
  {
    "jobId": "789a0123-b45c-67d8-e901-234567890000",
    "audioId": "456e7890-e12b-34d5-a678-901234567000",
    "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
    "audioName": "background_music.mp3",
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:30:15Z",
    "reason": null
  },
  {
    "jobId": "abc12345-d67e-89f0-a123-456789012345",
    "audioId": "def67890-a12b-34c5-d678-901234567890",
    "audioGroupId": "123e4567-e89b-12d3-a456-426614174000",
    "audioName": "invalid_audio.aac",
    "status": "failed",
    "createdAt": "2024-01-15T09:15:00Z",
    "completedAt": "2024-01-15T09:15:05Z",
    "reason": "Unsupported audio codec"
  }
]
```

---

## GET /Audio/list

**Get audio files for the current user across all groups (paginated).**

Returns audio files owned by the current user, organized by their asset groups. This endpoint is primarily used for the direct render audio picker, where users can select any audio file without campaign restrictions.

### Use cases
- Direct render audio selection (no campaign linkage required)
- Getting a complete overview of all audio files

### Parameters

| Name | In | Type | Required | Default | Description |
|------|-----|------|----------|---------|-------------|
| `skip` | query | int32 | No | 0 | Pagination offset |
| `take` | query | int32 | No | 100 | Number of results |
| `search` | query | string | No | - | Search term |

### Responses

| Code | Description |
|------|-------------|
| 200 | Audio files retrieved successfully |
| 401 | Missing or invalid API key |

### Response includes
- Audio file metadata (id, name, duration, size)
- Group information (groupId, groupName)
- Only completed (processed) audio files are returned

---

# Render Endpoints

## POST /Render

**Create a new video render job.**

Submit a render request to generate a video. Supports two modes:

### 1. Campaign Mode (using TemplateInstanceId)
Render a specific instance of a template within a campaign context.
- Requires `templateInstanceId`

### 2. Direct Mode (using TemplateId)
Render a template directly without a campaign.
- Requires `templateId`

### Prerequisites
1. Sufficient VM budget remaining for rendering
2. Sufficient storage space available for output video

### Required Fields
- One of: `templateInstanceId` OR `templateId`
- `name`: Display name for this render
- `encoderConfig`: Video encoding settings (at minimum, `bitrate`)

### Optional Fields
- `audioId`: UUID of audio file from an audio asset group linked to the campaign
- `jobInfo.fStart`: Start frame for rendering range (default: 0)
- `jobInfo.fEnd`: End frame for rendering range (default: last frame)
- `encoderConfig.fpsNum`: Frame rate numerator (e.g., 30)
- `encoderConfig.fpsDenum`: Frame rate denominator (e.g., 1)
- `encoderConfig.res`: Resolution as [width, height] array (e.g., [1920, 1080])
- `encoderConfig.codec`: Codec selection (0=H.264, 1=H.265, 2=AV1)
- `encoderConfig.preset`: Encoder preset 0-5 (higher = faster encoding, larger file)
- `encoderConfig.rc`: Rate control mode (0=CBR, 1=VBR, 2=CQP)
- `encoderConfig.gop`: Group of Pictures size
- `encoderConfig.idr`: IDR interval
- `encoderConfig.profile`: Codec profile
- `encoderConfig.level`: Codec level
- `customizationMap`: Array of layer replacement customizations

### Request Body Configuration

**Campaign Mode:**
```json
{
  "templateInstanceId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "CampaignVideo",
  "encoderConfig": { "bitrate": 5000000 }
}
```

**Direct Mode:**
```json
{
  "templateId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "DirectVideo",
  "encoderConfig": { "bitrate": 5000000 }
}
```

**Full Example with optional fields:**
```json
{
  "templateInstanceId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "VideoName",
  "audioId": "789a0123-b45c-67d8-e901-234567890000",
  "jobInfo": {
    "fStart": 0,
    "fEnd": 300
  },
  "encoderConfig": {
    "fpsNum": 30,
    "res": [1920, 1080],
    "bitrate": 5000000,
    "codec": 0,
    "preset": 2
  },
  "customizationMap": []
}
```

### Using audio in renders

1. Create an audio asset group via `POST /audio-asset-group`
2. Upload audio file to the group via `POST /audio-asset-group/{groupId}/audio`
3. Link the audio asset group to the campaign via `POST /campaign/{campaignId}/audio-groups/{groupId}`
4. Wait for audio processing to complete (poll `GET /audio/{audioId}/status`)
5. Include the audioId in your render request

### Example usage

[code-tabs: cURL, JS (Fetch), JS (Axios)]
```bash
# cURL (Direct Mode)
curl -X POST https://api.veloo.io/render \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "DirectVideo",
    "encoderConfig": { "bitrate": 5000000 }
  }'
```
```javascript
// JavaScript (Fetch)
const response = await fetch('https://api.veloo.io/render', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'DirectVideo',
    encoderConfig: { bitrate: 5000000 }
  })
});

const data = await response.json();
console.log(data.renderId);
```
```javascript
// JavaScript (Axios)
const response = await axios.post('https://api.veloo.io/render', {
  templateId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'DirectVideo',
  encoderConfig: { bitrate: 5000000 }
}, {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

console.log(response.data.renderId);
```

### Responses

| Code | Description |
|------|-------------|
| 200 | Render job created and queued successfully |
| 400 | Invalid request (missing ID, invalid config) |
| 401 | Missing or invalid API key |
| 402 | Insufficient VM budget to complete render |

### Example Response

```json
{
  "renderId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending"
}
```

---

## GET /Render/{renderId}/status

**Get real-time status and progress of a render job.**

Poll this endpoint to monitor render progress from submission to completion.

### Render lifecycle stages

1. **"pending"** - Render queued, waiting for VM availability
2. **"processing"** - Actively being rendered on VM (2-10 minutes average)
3. **"completed"** - Render finished, video ready for download
4. **"failed"** - Render failed (see reason)
5. **"cancelled"** - Manually cancelled by user or admin

### How to use

1. Submit render via `POST /render`
2. Receive render ID in response
3. Poll this endpoint every 5-10 seconds
4. When status is "completed", download video

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `renderId` | path | uuid | Yes | UUID of the render job |

### Responses

| Code | Description |
|------|-------------|
| 200 | Status retrieved successfully |
| 404 | Render not found or not owned by current user |
| 401 | Missing or invalid API key |

### Example usage

[code-tabs: cURL, JS (Fetch), JS (Axios)]
```bash
# cURL
curl -H "X-API-Key: your-api-key" \
  https://api.veloo.io/render/{renderId}/status
```
```javascript
// JavaScript (Fetch)
const renderId = 'your-render-id';
const response = await fetch(`https://api.veloo.io/render/${renderId}/status`, {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

const data = await response.json();
console.log(data.status); // "pending", "processing", "completed", "failed"
```
```javascript
// JavaScript (Axios)
const renderId = 'your-render-id';
const response = await axios.get(`https://api.veloo.io/render/${renderId}/status`, {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

console.log(response.data.status);
```

### Example Response (processing)

```json
{
  "renderId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "MyVideo",
  "templateId": "550e8400-e29b-41d4-a716-446655440000",
  "templateName": "MyTemplate",
  "status": "processing",
  "videoDownloadUrl": null,
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": null,
  "renderTimeMilliseconds": null,
  "sizeBytes": null,
  "reason": null
}
```

### Example Response (completed)

```json
{
  "renderId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "MyVideo",
  "templateId": "550e8400-e29b-41d4-a716-446655440000",
  "templateName": "MyTemplate",
  "status": "completed",
  "videoDownloadUrl": "/render/123e4567-e89b-12d3-a456-426614174000/download",
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:30Z",
  "renderTimeMilliseconds": 330000,
  "sizeBytes": 15728640,
  "reason": null
}
```

---

## POST /Render/{renderId}/cancel

**Cancel an active render job.**

Stop a render job that is currently processing. VM resources are released immediately.

### When to use
- Submitted render with wrong data
- Need to free up VM budget quickly
- Render taking longer than expected
- Want to modify and resubmit

### Cancellation behavior
- **Processing renders:** Stopped immediately, partial VM time may be charged
- **Completed renders:** Cannot be cancelled (already finished)

### After cancellation
- Render status becomes "cancelled"
- No video file is produced
- VM time used (if any) is still deducted from budget
- Must submit new render request if needed

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `renderId` | path | uuid | Yes | UUID of the render job to cancel |

### Responses

| Code | Description |
|------|-------------|
| 200 | Render cancelled successfully |
| 404 | Render not found or not owned by current user |
| 401 | Missing or invalid API key |
| 409 | Render already completed or cancelled |

---

## DELETE /Render/{renderId}

**Permanently delete a completed render and its video file.**

Remove a render from your account and delete the video file from storage. This action cannot be undone.

### What gets deleted
- Rendered video file
- Render metadata and settings
- Job history record

### Use cases
- Free up storage quota
- Remove test or draft renders
- Clean up old renders no longer needed
- Manage storage costs

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `renderId` | path | uuid | Yes | UUID of the render to delete |

### Responses

| Code | Description |
|------|-------------|
| 200 | Render deleted successfully |
| 404 | Render not found or not owned by current user |
| 401 | Missing or invalid API key |

> **Important:** Cannot delete renders that are currently processing (cancel first). Download video before deleting if you need to keep it. VM time already consumed is not refunded.

---

## GET /Render/all

**Retrieve all completed renders owned by the current user.**

Returns a paginated list of successfully completed renders with download links.

### Parameters

| Name | In | Type | Required | Default | Description |
|------|-----|------|----------|---------|-------------|
| `skip` | query | int32 | No | 0 | Pagination offset |
| `take` | query | int32 | No | 50 | Number of results (max: 100) |

### Responses

| Code | Description |
|------|-------------|
| 200 | Renders retrieved successfully |
| 401 | Missing or invalid API key |

### Returns for each render
- Render ID
- Template ID and name
- Render name
- Video download URL
- Completion timestamp
- Render time in milliseconds
- File size in bytes

> **Note:** Only includes completed renders. For in-progress renders, use `GET /render/active`

---

## GET /Render/active

**Retrieve all renders currently processing.**

Shows renders that are queued or actively being rendered, but not yet completed.

### Use cases
- Monitor current render queue
- Check if renders are processing
- Track active jobs

### Responses

| Code | Description |
|------|-------------|
| 200 | Active renders retrieved successfully |
| 401 | Missing or invalid API key |

> **Note:** Completed, failed, and cancelled renders are not included. Use `GET /render/history` for those.

---

## GET /Render/history

**Retrieve historical render jobs including completed, failed, and cancelled renders.**

Returns complete render history with optional filtering by outcome status.

### Parameters

| Name | In | Type | Required | Default | Description |
|------|-----|------|----------|---------|-------------|
| `status` | query | string | No | - | "completed", "failed", or "cancelled" |
| `skip` | query | int32 | No | 0 | Pagination offset |
| `take` | query | int32 | No | 100 | Number of results (max: 200) |

### Common failure reasons
- Invalid ZIP structure during upload (must be flat or single container folder)
- data.json not found or not parseable
- Missing images/ folder when referenced in data.json
- Invalid frame range (FrameStart >= FrameEnd)
- Invalid encoder configuration parameters
- Insufficient VM budget mid-render
- Unsupported codecs in video/audio assets
- VM instance failures

### Responses

| Code | Description |
|------|-------------|
| 200 | History retrieved successfully |
| 401 | Missing or invalid API key |

### Example Requests
```
GET /render/history
GET /render/history?status=failed
GET /render/history?status=completed&skip=20&take=50
```

---

## GET /Render/renders/{renderId}

**Get detailed information about a specific completed render.**

Retrieve comprehensive metadata and details for a completed render job.

### Use cases
- Get render metadata before downloading
- Verify render settings and output
- Check file size
- Retrieve download URL

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `renderId` | path | uuid | Yes | UUID of the completed render |

### Responses

| Code | Description |
|------|-------------|
| 200 | Render details retrieved successfully |
| 404 | Render not found, not completed, or not owned by current user |
| 401 | Missing or invalid API key |

> **Note:** Only works for completed renders. For renders still processing, use `GET /render/{renderId}/status`

---

## GET /Render/{renderId}/download

**Download the rendered video file.**

Stream the completed render video file directly to your client.

### How to use
1. Wait for render status to be "completed"
2. Send GET request to this endpoint
3. Receive video file stream with appropriate content type

### Response
- **Content-Type:** video/mp4, video/quicktime, or video/x-msvideo
- **Content-Disposition:** attachment with filename
- File streamed directly (no buffering required)

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `renderId` | path | uuid | Yes | UUID of the completed render |

### Responses

| Code | Description |
|------|-------------|
| 200 | Video download started successfully |
| 404 | Render not found, not completed, or not owned by current user |
| 401 | Missing or invalid API key |

### Download Examples

**cURL:**
```bash
curl -H "X-API-Key: your-api-key" \
  -o video.mp4 \
  https://api.veloo.io/render/{renderId}/download
```

**JavaScript:**
```javascript
fetch(`https://api.veloo.io/render/${renderId}/download`, {
  headers: { 'X-API-Key': 'your-api-key' }
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'video.mp4';
  a.click();
});
```

### Notes
- Large files may take time to download based on connection speed
- Video remains available until explicitly deleted
- Downloads do not count against VM budget (only storage)
- Supports range requests for partial downloads/streaming

---

## GET /Render/render-time-budget-status

**Check current render time budget quota and usage statistics.**

Returns detailed information about render time allocation and current usage.

### Responses

| Code | Description |
|------|-------------|
| 200 | Render time budget status retrieved successfully |
| 401 | Missing or invalid API key |

### Example Response

```json
{
  "usedMilliseconds": 180000,
  "remainingMilliseconds": 120000,
  "totalMilliseconds": 300000,
  "usagePercentage": 60.0
}
```

### Use cases
- Check available render time before submitting render
- Monitor render time budget consumption
- Determine if budget top-up is needed

> **Note:** Contact admin to increase render time budget if needed. Budget is consumed based on render duration.

---

# Schemas

## JobStatus

Possible values for job status throughout its lifecycle:

| Value | Description |
|-------|-------------|
| `Pending` | Job is queued |
| `Processing` | Job is actively running |
| `Cancelling` | Cancellation in progress |
| `Completed` | Job finished successfully |
| `Failed` | Job failed (see reason) |
| `Cancelled` | Job was cancelled |
| `Deleted` | Job record was deleted |

---

## RenderRequest

Request body for creating a new render job.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `templateInstanceId` | uuid | Conditional | Template Instance ID for campaign renders. Either this OR `templateId` must be provided. |
| `templateId` | uuid | Conditional | Template ID for direct renders. Either this OR `templateInstanceId` must be provided. |
| `name` | string | Yes | User-defined name for this render (max 255 chars) |
| `audioId` | uuid | No | Optional audio ID to use for this render |
| `jobInfo` | JobInfo | No | Frame range configuration |
| `encoderConfig` | EncoderConfig | Yes | Video encoding settings |
| `customizationMap` | array | No | Layer replacement customizations |

---

## JobInfo

Frame range configuration for rendering.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fStart` | int32 | No | Start frame (default: 0) |
| `fEnd` | int32 | No | End frame (default: last frame) |

---

## EncoderConfig

Video encoder configuration.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `bitrate` | int32 | Yes | Video bitrate in bytes |
| `fpsNum` | int32 | No | FPS numerator |
| `fpsDenum` | int32 | No | FPS denominator |
| `res` | [int, int] | No | Resolution as [width, height] |
| `codec` | int32 | No | 0=H.264, 1=H.265, 2=AV1 |
| `preset` | int32 | No | 0-5 (higher = faster, larger file) |
| `rc` | int32 | No | Rate control: 0=CBR, 1=VBR, 2=CQP |
| `gop` | int32 | No | Group of Pictures size |
| `idr` | int32 | No | IDR interval |
| `profile` | int32 | No | Codec profile |
| `level` | int32 | No | Codec level |

---

## AudioDto

Audio file information.

| Property | Type | Description |
|----------|------|-------------|
| `id` | uuid | Audio ID |
| `audioAssetGroupId` | uuid | Parent group ID |
| `name` | string | Audio filename |
| `sizeBytes` | int64 | File size |
| `createdAt` | datetime | Upload timestamp |
| `originalFormat` | string | Original file format |

---

## AudioJobDto

Audio processing job status.

| Property | Type | Description |
|----------|------|-------------|
| `jobId` | uuid | Job ID |
| `audioId` | uuid | Audio ID |
| `audioAssetGroupId` | uuid | Parent group ID |
| `audioName` | string | Audio filename |
| `status` | JobStatus | Current status |
| `createdAt` | datetime | Job creation time |
| `completedAt` | datetime | Job completion time (nullable) |
| `reason` | string | Failure reason (nullable) |

---

## RenderDto

Completed render information.

| Property | Type | Description |
|----------|------|-------------|
| `renderId` | uuid | Render ID |
| `templateInstanceId` | uuid | Template instance (campaign mode) |
| `templateId` | uuid | Template ID (direct mode) |
| `campaignId` | uuid | Campaign ID (if applicable) |
| `name` | string | Render name |
| `videoDownloadUrl` | string | Download URL |
| `templateInstanceName` | string | Instance name |
| `templateName` | string | Template name |
| `isDirectRender` | boolean | True if direct mode |
| `renderedAt` | datetime | Completion timestamp |
| `renderTimeMilliseconds` | int64 | Render duration |
| `sizeBytes` | int64 | Output file size |

---

## RenderJobDto

Render job status.

| Property | Type | Description |
|----------|------|-------------|
| `renderId` | uuid | Render ID |
| `name` | string | Render name |
| `templateInstanceId` | uuid | Template instance ID |
| `campaignId` | uuid | Campaign ID |
| `templateInstanceName` | string | Instance name |
| `templateId` | uuid | Template ID |
| `templateName` | string | Template name |
| `isDirectRender` | boolean | True if direct mode |
| `status` | JobStatus | Current status |
| `videoDownloadUrl` | string | Download URL (if completed) |
| `startedAt` | datetime | Start timestamp |
| `completedAt` | datetime | Completion timestamp |
| `renderTimeMilliseconds` | int64 | Render duration |
| `sizeBytes` | int64 | Output file size |
| `reason` | string | Failure reason (if failed) |

---

## TemplateDto

Template information.

| Property | Type | Description |
|----------|------|-------------|
| `id` | uuid | Template ID |
| `name` | string | Template name |
| `sizeBytes` | int64 | File size |
| `createdAt` | datetime | Upload timestamp |

---

## TemplateJobDto

Template processing job status.

| Property | Type | Description |
|----------|------|-------------|
| `jobId` | uuid | Job ID |
| `templateId` | uuid | Template ID |
| `templateName` | string | Template name |
| `status` | JobStatus | Current status |
| `createdAt` | datetime | Job creation time |
| `completedAt` | datetime | Completion time |
| `reason` | string | Failure reason (if failed) |

---

## StorageStatusDto

User storage status.

| Property | Type | Description |
|----------|------|-------------|
| `quotaMB` | int32 | Total quota in MB |
| `usedBytes` | int64 | Used storage |
| `availableBytes` | int64 | Available storage |
| `usagePercentage` | double | Usage percentage |

---

## RenderTimeBudgetStatusDto

User render time budget status.

| Property | Type | Description |
|----------|------|-------------|
| `usedMilliseconds` | int64 | Used render time |
| `remainingMilliseconds` | int64 | Remaining render time |
| `totalMilliseconds` | int64 | Total budget |
| `usagePercentage` | double | Usage percentage |
