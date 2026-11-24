# 10 — Open Questions

| ID | Question | Why it matters |
| :--- | :--- | :--- |
| Q-01 | Confirm GS1 company prefix / GTIN allocation and GS1 element-string encoding. | QR and label legality; cannot invent identifiers. |
| Q-02 | Confirm allowed mass variance percentage/value and who approves exceptions. | Receipt hard gate. |
| Q-03 | Which exact SCM 1.7.0 changes are approved for deployment, if any? | Current repo add-on is ahead of live database. |
| Q-04 | Which modules belong in first SCM release: master data, harvest, distillation, QC, receipt, trace, labels, partner portal? | Scope and acceptance boundary. |
| Q-05 | Confirm actual Accurate Online OAuth variable names and scope set; keep values in `.env.local`. | Secure integration setup. |
| Q-06 | Should `/hris` remain the canonical route root for HRM, or should it migrate to `/hrm`? | Navigation and documentation consistency. |
| Q-07 | What database/entity access model applies to cross-company users? | Multi-company authorization. |
| Q-08 | Which staff role can approve supplier audits, QC release, and CAPA closure? | Separation of duties. |
| Q-09 | What public trace fields are approved by Legal/Commercial? | Privacy and trade-secret minimization. |
| Q-10 | Confirm the policy for portal file retention, consent, and deletion requests. | Privacy and storage lifecycle. |
