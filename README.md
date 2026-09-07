# 🚀 AI-Based Human Recognition & Activity Detection for Microgravity

## 📌 Overview

An **edge-deployed AI-powered monitoring system** designed to recognize humans and detect their activities in microgravity environments such as spacecraft and space stations.

The system combines **Human Recognition** and **Human Activity Detection (HAD)** using lightweight computer vision models that can operate locally on **space-hardened edge hardware**, enabling real-time monitoring without depending on continuous cloud connectivity.

## 🎯 Problem Statement

In microgravity environments, continuously monitoring astronauts and their interactions with equipment is challenging due to:

* Unpredictable body movements caused by microgravity.
* Difficulty in identifying and tracking human activities.
* Limited computational resources and communication bandwidth.
* Need for real-time monitoring with minimal latency.
* Safety risks associated with incorrect instrument handling or abnormal activities.

## 💡 Proposed Solution

Our solution provides an intelligent edge-based monitoring system that:

* 👤 **Recognizes humans** and tracks their presence within the monitored environment.
* 🧍 **Detects human activities** such as gestures, posture, movement, and instrument handling.
* ⚡ Performs **real-time inference locally** on edge hardware.
* 📡 Reduces dependency on cloud connectivity and minimizes communication latency.
* 🚨 Generates alerts for predefined abnormal or potentially unsafe activities.

## 🔄 System Workflow

```text
Camera / Video Input
        ↓
Preprocessing
        ↓
Human Detection & Recognition
        ↓
Pose / Gesture / Object Analysis
        ↓
Human Activity Detection
        ↓
Activity Classification
        ↓
Risk / Event Analysis
        ↓
Real-Time Monitoring & Alerts
```

## 🧠 Key Features

### 1. Human Recognition

Detects and identifies astronauts/personnel within the camera feed.

### 2. Human Activity Detection

Analyzes body posture, gestures, movement patterns, and interactions with objects.

### 3. Instrument Interaction Monitoring

Tracks activities involving important instruments and equipment.

### 4. Edge AI Processing

Runs lightweight AI models directly on edge devices to provide low-latency inference.

### 5. Real-Time Alerts

Identifies predefined abnormal or safety-critical activities and generates alerts.

### 6. Microgravity-Aware Analysis

Designed to account for unusual body orientations and movement patterns caused by microgravity.

## 🏗️ Proposed Architecture

```text
             ┌─────────────────┐
             │ Camera / Sensors │
             └────────┬────────┘
                      ↓
             ┌─────────────────┐
             │ Preprocessing   │
             └────────┬────────┘
                      ↓
          ┌───────────────────────┐
          │ Human Detection       │
          │ & Recognition         │
          └───────────┬───────────┘
                      ↓
          ┌───────────────────────┐
          │ Pose / Gesture /      │
          │ Object Detection      │
          └───────────┬───────────┘
                      ↓
          ┌───────────────────────┐
          │ Activity Detection    │
          │ & Classification      │
          └───────────┬───────────┘
                      ↓
          ┌───────────────────────┐
          │ Risk / Event Analysis │
          └───────────┬───────────┘
                      ↓
             ┌─────────────────┐
             │ Alerts / Dashboard│
             └─────────────────┘
```
## System Architecture 
<img width="3456" height="1944" alt="SIH26174_Pastel_Architecture" src="https://github.com/user-attachments/assets/2f12e4b2-11af-46ab-b86e-ce77797b9bed" />

##  🛠️Technology Stack

| Category         | Technologies                        |
| ---------------- | ----------------------------------- |
| Programming      | Python                              |
| Computer Vision  | OpenCV                              |
| AI / ML          | PyTorch / TensorFlow                |
| Object Detection | YOLO                                |
| Pose Estimation  | MediaPipe / Lightweight Pose Models |
| Backend          | Flask / FastAPI                     |
| Edge Deployment  | NVIDIA Jetson / Edge AI Hardware    |
| Data Processing  | NumPy, Pandas                       |
| Visualization    | Web Dashboard                       |
| Version Control  | Git, GitHub                         |

## ⭐ Innovation & Uniqueness

* **Multimodal Fusion:** Combines human recognition, pose, gesture, activity, and object interaction information for more reliable monitoring.
* **Edge-Based Intelligence:** Performs AI inference locally, reducing latency, bandwidth requirements, and dependence on remote servers.
* **Microgravity-Aware Activity Detection:** Adapts activity analysis to unusual orientations and movement patterns encountered in microgravity.
* **Safety-Oriented Monitoring:** Can identify potentially abnormal activities and instrument-handling events in real time.

## 🌍 Potential Impact

* Improves **astronaut safety** through continuous automated monitoring.
* Enables **real-time onboard intelligence** without requiring constant cloud connectivity.
* Reduces workload on ground-control teams.
* Helps detect abnormal activities and potentially unsafe equipment interactions.
* Provides a scalable foundation for future **AI-assisted space missions**.

## 📈 Benefits

* ⚡ Low-latency real-time processing
* 🔒 Local processing and improved data privacy
* 📡 Reduced communication bandwidth
* 🧠 Automated activity monitoring
* 🚨 Faster detection of abnormal events
* 🚀 Suitable for future autonomous space missions

## 🔮 Future Scope

* Integration with multiple onboard cameras and sensors.
* Advanced temporal activity recognition using video sequences.
* Multi-person tracking and identification.
* Integration with spacecraft environmental sensors.
* Predictive detection of potentially dangerous activities.
* Deployment on radiation-tolerant and space-qualified computing platforms.
* Integration with autonomous spacecraft robotic systems.

## 👥 Team

**Developed for Smart India Hackathon 2026**

**Problem Statement:** `SIH26174`

---

## 📄 License

This project is developed as a **Smart India Hackathon 2026** solution and is intended for educational, research, and prototype development purposes..
