# 📄 AI PDF Immersive Translator | 沉浸式文档翻译工具

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![OpenAI](https://img.shields.io/badge/LLM-OpenAI%20API-green)
![Streamlit](https://img.shields.io/badge/Framework-Streamlit-red)
![Status](https://img.shields.io/badge/Status-MVP-orange)

> **"Break language barriers, preserve knowledge structure."**
>
> 一个不仅翻译文字，更能保留文档布局（Layout-Preserving）的智能翻译工具。专为处理外贸财报、学术论文、技术文档设计。

---

## 🎯 The Problem (为什么做这个?)

作为一名 AI 关注者和外贸行业从业者，我发现市面上的翻译工具存在两个核心痛点：
1.  **格式崩溃 (Format Destruction)**：传统的复制粘贴翻译会破坏 PDF 的段落结构，表格和多栏排版完全错乱。
2.  **语境缺失 (Context Loss)**：普通机器翻译（SMT）无法理解专业术语（如 "Short" 在金融是“做空”，在日常是“短”），导致关键信息误读。

**Solution**: 本项目利用 `PyMuPDF` 提取精确坐标，结合 **LLM (Large Language Model)** 的上下文理解能力，实现了“原位翻译”——在保留原始阅读体验的同时，提供专家级的翻译质量。

---

## ✨ Key Features (核心功能)

* **📄 markdown格式输出**: 基于坐标流重构文档，翻译后的 PDF 输出为markdown格式，阅读体验良好。
* **⚡ 流式极速体验**: 采用 Streamlit 构建前端，支持文件拖拽上传与实时翻译进度展示。
* **🛡️ 隐私安全**: 代码开源，支持本地部署，API Key 本地存储，文档不经过第三方不可控服务器。

---

## 📸 ScreenShots (效果演示)

*<img width="1848" height="965" alt="image" src="https://github.com/user-attachments/assets/2f69aebe-ba91-44c9-833b-6a23193c49d0" />
<img width="1830" height="960" alt="image" src="https://github.com/user-attachments/assets/faf7fa29-a7e1-4315-b380-f50cc4ce53a6" />
<img width="1369" height="751" alt="image" src="https://github.com/user-attachments/assets/de8a2bc0-1171-4ba6-80ec-1f7f11304097" />
*
> *Translation Demo: Financial Report (Left) vs Translated Output (Right)*

---

## 🚀 Quick Start (快速开始)

### 1. Clone the repo
```bash
git clone [https://github.com/YourUsername/ai-pdf-translator.git](https://github.com/YourUsername/ai-pdf-translator.git)
cd ai-pdf-translator
