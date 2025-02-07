# 3D Model and GIS Visualizer  

<img src="dashboard-image.jpeg" alt="thumbnail" width="50%">

## Overview  
A web-based application to visualize 3D point cloud data and GeoJSON maps. Users can upload .pcd, .xyz, and .geojson files to interactively explore and manipulate 3D models and GIS data.


## Features  
- Upload `.pcd`, `.xyz`, and `.geojson` files  
- **3D Viewer**: Rotate, zoom, change point size, and color  
- **GIS Viewer**: Pan, zoom, and view metadata  
- Switch between **Point Cloud** and **GeoJSON** modes  
- User activity tracking  

## Tech Stack  
- **Three.js** – 3D rendering  
- **OpenLayers** – GIS visualization  
- **React.js** – UI framework  

## Setup  
```sh
npm install  
npm start  
```

## Usage  
1. Click **Point Cloud** or **GeoJSON** to select a mode.  
2. Upload a **.pcd**, **.xyz**, or **.geojson** file.  
3. **Interact** with the visualization:  
   - Rotate, zoom, and pan (for 3D models).  
   - Change point size (scroll) and color.  
   - View metadata below the upload section.  
4. **Switch modes** anytime.  
5. **Track user activity** in the footer.  
