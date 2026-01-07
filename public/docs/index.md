<link rel="stylesheet" href="stylesheets/extra.css" />
# Velocity Essentials

*Velocity is the engine that powers next-generation creative applications. Embedding this API into your product provides an enormous boost in speed and scalability.*

## What is Velocity

Velocity is an **API-driven motion graphics video rendering platform**, designed from the ground up for **blazing performance** (on average 10× faster than Adobe After Effects) and **massive scalability**.
At the core of the engine is a GPU-accelerated rendering pipeline built on top of modern, industry-standard low-level graphics and video encoding APIs.


[provide some benchmarks of templates rendering with Velocity vs AE]

The Velocity API enables server-side rendering of videos from Adobe After Effects (AE) motion templates exported as Lottie files. While Velocity uses the Lottie format as a base, it has significantly fewer limitations than standard Lottie implementations(see the [AE Compatibility](ae.md) page).
Our development team is continuously extending support for advanced AE features and visual effects, with the goal of reaching core feature parity with AE in the near future.  

*Note: Full AE feature coverage is not planned, as rendering speed remains a top priority for the product.*

**Classic Rendering Pipeline**

In addition to AE-based content, Velocity also supports what we call “**Classic Rendering**” — a pipeline for layer-based rendering of images, text, and vector shapes, independent of AE-specific features.
This pipeline can be used by developers who author graphics using HTML5 APIs such as Canvas 2D, or who import graphics from other sources.

  

**Example use case:**
You need to compose a set of AI-generated images with accompanying text. Using the ClassicRenderer, you can define layer order, transforms, opacity, blend modes, and optionally apply color grading and post-processing filters.

This pipeline is optimized for extreme performance, capable of compositing at 1000 FPS and beyond. It also fully supports the HTML Canvas 2D drawing API, enabling pixel-perfect rendering of shapes designed in HTML.

## Input Formats

**Motion Templates**:
Motion templates are exported from Adobe After Effects using the **Bodymovin** extension.  
Before upload, the Lottie folder (containing `data.json` and related assets) must be compressed into a `.zip` archive.  
For more details, see the [Getting Started](tutorials.md) section.

**Image Formats**:

- **PNG** (24/32-bit)\*  
- **TGA** (3/4 channels)\*  
- **JPEG**  
- **GIF**

\* Images with alpha channels must use **straight alpha**, not premultiplied alpha.

**Video Formats**:

- **MP4** (H.264 / HEVC codecs)  
- **WebM** (VP8, VP9)  
- **AV1** (Main profile)

**Fonts**

- **TrueType (TTF)**  
- **OpenType (OTF)**


## Output Formats

**Video Formats**:

- **MP4** container with **H.264** or **HEVC** codecs

**Audio Formats**:

- **AAC**  
- **MP3**  
- **WAV**

*Note:* **AAC** is recommended as it reduces multiplexing latency as MP4 and WAV undergo transcoding.


