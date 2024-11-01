# Unmask: Ensuring Media Authenticity in the Age of Deepfakes

**Tagline:** 🔍 Ensuring Media Authenticity in the Age of Deepfakes

## Overview

**Unmask** is a cutting-edge service that combines advanced AI for deepfake detection with blockchain technology to provide tamper-proof certification of media authenticity. Users can upload media files (images, videos, audio), and the system will analyze them for signs of manipulation. If the media is verified as authentic, a digital certificate of authenticity is generated and stored on the blockchain. This certification can be accessed via an intuitive web application, and users can pay for the service using cryptocurrency.

## Problem It Solves

In an era where synthetic media and deepfake technology are becoming increasingly prevalent, distinguishing between real and manipulated visual content is a critical challenge. **Unmask** addresses this issue by providing a reliable and accessible tool for detecting deepfakes and issuing verifiable certificates. This service empowers users to make informed decisions about the credibility of multimedia content, thereby enhancing trust in digital media.

## Use Cases

1. **Social Media Verification**: Verify the authenticity of media by forwarding it to our WhatsApp bot or uploading it on our website.
2. **Journalism and News**: Journalists and news organizations can authenticate media before publishing to maintain credibility.
3. **Legal Evidence**: Legal professionals can verify digital evidence for admissibility in court.
4. **Personal Use**: Individuals can validate personal photos or videos used in online dating or professional profiles.

## Key Features

- **Deepfake Detection AI**: Uses AI models (CNNs, RNNs, transformers) to detect deepfakes and provide a confidence score.
- **Blockchain Certification**: Uses Alephium for storing tamper-proof certificates.
- **Cryptocurrency Payment System**: Integrates Alphium for payment, enabling secure transactions.
- **User Interface**: Web-based application for easy media upload and certificate access.

## Technologies Used

- **Design**: Figma
- **Frontend**: React.js (JavaScript)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Blockchain**: Alephium
- **AI Models**: TensorFlow, PyTorch

## Challenges We Encountered

During development, we encountered a version dependency error when installing requirements for the deep learning model. This issue was resolved by creating two separate requirements files to manage dependencies effectively.

---

## Installation and Setup

To run **Unmask**, follow the instructions below.

### Prerequisites

- Node.js
- Python 3.x
- MongoDB
- Alephium CLI
- Uvicorn

### Clone the Repository

```bash
git clone https://github.com/iDhanush/AlephiumHackathon2024.git
cd unmask
```
### Blockchain Node Server
Navigate to the alephium directory:
```bash
cd alephium
```
Install dependencies:
```bash
npm install
```
Compile the contract:
```bash
npx @alephium/cli@latest compile
```
Run the main server:
```bash
npx ts-node src/main.ts
```
### Backend
Navigate to the backend directory:
```bash
cd backend33
```
Install Python dependencies:
```bash
pip install -r requirements.txt
```
Start the backend server:
```bash
uvicorn main:app --reload
```
### Frontend
Navigate to the frontend directory:
```bash
cd frontend
```
Install frontend dependencies:
```bash
npm install
```
Run the frontend server:
```bash
npm run dev
```
