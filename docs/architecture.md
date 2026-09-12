# Pixel Pet Architecture

Pixel Pet is built as an Electron desktop application using a separated
main process and renderer process.

## High-Level Architecture

```text
                    Electron Application
                            |
             +--------------+--------------+
             |                             |
             v                             v
       Main Process                  Renderer Process
       (Electron)                   (HTML/CSS/JS)
             |                             |
             v                             v
      Window Management              Pet Controller
      IPC Communication                    |
      System Integration                   |
             |                  +----------+----------+
             |                  |          |          |
             |                  v          v          v
             |             Animation   Movement    Behavior
             |                  |          |          |
             |                  +----------+----------+
             |                             |
             |                             v
             |                       State Manager
             |                             |
             |                             v
             |                        Stats Manager
             |                             |
             |                  +----------+----------+
             |                  |          |          |
             |                  v          v          v
             |              Interaction Messages   Breaks
             |                  Manager   Manager   Manager
             |
             v
       Preload / IPC Bridge