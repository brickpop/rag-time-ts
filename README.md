# RAG Time

Components:

- Vector Store
- Vector Store API (Core)
  - Role based access
  - API keys
    - Allowed labels
- WriterNode
  - Config (auth), remote, etc
  - Parse txt, md, pdf, ...
  - Generate labels
    - Categorize, roles
- ReaderNode
  - Config
    - Auth, remote, etc
    - System prompts
  - Query handler (router)
  - Gathering
    - Query anonymizer
    - Searxng
      - Log requested searches
    - Vector Store
  - Doc filter
  - Answer filter
    - Loop to extend search
  - Result
