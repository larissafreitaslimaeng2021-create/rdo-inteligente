# Security Specification for RDO Inteligente

## 1. Data Invariants
1. Unauthenticated users cannot read, write, list, update, or delete any data in any collection.
2. A user document in `/users/{userId}` can only be written by the authenticated user whose `auth.uid == userId`.
3. Self-assigned role escalation is forbidden: users cannot elevate their role to arbitrary privileges without authorization.
4. Users with role 'Visualizador' have read-only access (no create, update, or delete).
5. Users with role 'Editor' can create and edit Obras, Empresas, Equipe, RDOs, and Documents.
6. A finished RDO (`status: "Finalizado"`) cannot be mutated or downgraded to draft by non-editors, protecting the integrity of legal construction diaries.
7. Only authenticated members can read and create documents, and every document write must enforce maximum length limits and valid identity ownership.
8. Deletion of critical records (Obras, RDOs) is strictly limited to authorized Editors or the original creator.

## 2. The Dirty Dozen Malicious / Invalid Payloads
1. **Unauthenticated List on /rdos**: An unauthenticated request tries to read all RDOs. -> EXPECT: PERMISSION_DENIED.
2. **Identity Spoofing on /users/{userId}**: User `attacker123` tries to overwrite `/users/victim456`. -> EXPECT: PERMISSION_DENIED.
3. **Role Escalation via Profile**: User sets their role to `Admin` or unauthorized root claim without permission. -> EXPECT: PERMISSION_DENIED.
4. **Visualizador Write Attempt on /rdos**: User with `Visualizador` role attempts to create or update an RDO. -> EXPECT: PERMISSION_DENIED.
5. **ID Poisoning Attack**: An attacker sends a document ID with 500 special junk characters. -> EXPECT: PERMISSION_DENIED.
6. **Shadow Field Injection on /obras**: Payload adds an arbitrary unexpected malicious object `hackField: { exploit: true }`. -> EXPECT: PERMISSION_DENIED.
7. **Oversized String Payload (Wallet Drain)**: An attacker attempts to write an activity description of 100MB to exhaust database resources. -> EXPECT: PERMISSION_DENIED.
8. **Forged CreatedBy on /rdos**: User `uid1` attempts to create an RDO setting `createdBy: "uid2"`. -> EXPECT: PERMISSION_DENIED.
9. **Mutation of Finalized RDO**: Modifying an RDO whose status is already "Finalizado" to tamper with inspection logs. -> EXPECT: PERMISSION_DENIED.
10. **Immutable Field Tampering**: Modifying the original `createdAt` or `createdBy` on an existing RDO. -> EXPECT: PERMISSION_DENIED.
11. **Negative Count in Labor**: Setting `quantidade: -50` in `maoDeObra` to corrupt cost metrics. -> EXPECT: PERMISSION_DENIED.
12. **Blanket Query Scraping**: Attempting an unrestricted list across foreign collections without required filters. -> EXPECT: PERMISSION_DENIED.
