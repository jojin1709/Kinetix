# Contributing to Kinetix

First off, thank you for considering contributing to Kinetix! It's people like you that make local open-source AI accessible to everyone.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Kinetix.git
   cd Kinetix
   ```
3. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/my-new-feature
   ```

## Development Guidelines

- **4GB VRAM Compatibility:** Any modifications to the diffusion pipeline (`wan_pipeline.py`) must remain compatible with 4GB VRAM consumer GPUs. Always preserve VAE chunking and model CPU offloading safeguards.
- **Frontend Code Quality:** Ensure all Next.js / TypeScript components pass type checking:
  ```bash
  cd frontend
  npx tsc --noEmit
  ```
- **Backend Formatting:** Follow PEP 8 guidelines for Python backend code.

## Submitting Pull Requests

1. Commit your changes with clear, descriptive commit messages.
2. Push your branch to GitHub.
3. Open a Pull Request targeting the `main` branch.
4. Describe the changes, motivation, and test results.

---
**Maintained by [JOJIN JOHN](https://github.com/jojin1709)**
