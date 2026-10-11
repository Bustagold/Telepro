# Security Specification: TelePro Hardened Access Rules

## 1. Data Invariants
- **Identity Invariant**: A user may only create or modify their own `users/{userId}` profile document (`userId == request.auth.uid`). Users cannot impersonate or claim another user's UID.
- **Handle Integrity**: User handles must be unique, lowercase/alphanumeric with underscores, bounded between 3 and 32 characters (`^[a-zA-Z0-9_]{3,32}$`).
- **Connection Isolation**: A connection document can only be created by `fromUserId == request.auth.uid`. Status updates to `accepted` or `declined` can only be performed by `toUserId == request.auth.uid`.
- **Organization Governance**: Only the organization creator/owner can modify organization core settings (`ownerId == request.auth.uid`). Public organizations are readable by authenticated members.
- **Message Integrity**: A message in `/conversations/{convId}/messages/{msgId}` can only be authored with `senderId == request.auth.uid`. Messages are immutable once posted.
- **Meeting Safety**: Meetings can be created by authenticated participants with a valid roomCode pattern.

---

## 2. The Dirty Dozen Payloads

1. **User Impersonation Write (Spoofed UID)**
   ```json
   { "path": "/users/victim_user_123", "data": { "userId": "attacker_999", "displayName": "Attacker", "handle": "victim", "email": "victim@evil.com" } }
   ```
   *Expected*: PERMISSION_DENIED (Must match `request.auth.uid`).

2. **Junk ID Resource Exhaustion**
   ```json
   { "path": "/users/long_junk_id_exceeding_128_characters_overflowing_storage_attack_vector_999999999999999999999999999999999999999999999999999999999999999999999999999", "data": { "userId": "test", "handle": "test" } }
   ```
   *Expected*: PERMISSION_DENIED (Document ID fails `isValidId`).

3. **Illegal Character Injection in User Handle**
   ```json
   { "path": "/users/valid_uid", "data": { "userId": "valid_uid", "handle": "<script>alert(1)</script>", "displayName": "XSS" } }
   ```
   *Expected*: PERMISSION_DENIED (Handle fails regex `^[a-zA-Z0-9_]{3,32}$`).

4. **Connection Forgery (Spoofed Requester)**
   ```json
   { "path": "/connections/conn_01", "data": { "fromUserId": "innocent_user", "toUserId": "target_user", "status": "pending" } }
   ```
   *Expected*: PERMISSION_DENIED (fromUserId is not `request.auth.uid`).

5. **Unauthorized Acceptance of Connection**
   ```json
   { "path": "/connections/conn_01", "update": { "status": "accepted" }, "asUser": "random_third_party" }
   ```
   *Expected*: PERMISSION_DENIED (Only `toUserId` can accept connection).

6. **Organization Hijack (Owner Takeover)**
   ```json
   { "path": "/organizations/tech_hub", "update": { "ownerId": "attacker_uid" } }
   ```
   *Expected*: PERMISSION_DENIED (Cannot mutate `ownerId`).

7. **Oversized Message Denial-of-Wallet Payload**
   ```json
   { "path": "/conversations/c1/messages/m1", "data": { "conversationId": "c1", "senderId": "auth_uid", "text": "A".repeat(50000), "type": "text" } }
   ```
   *Expected*: PERMISSION_DENIED (text exceeds max length 2000).

8. **Message Sender Spoofing**
   ```json
   { "path": "/conversations/c1/messages/m2", "data": { "conversationId": "c1", "senderId": "ceo_uid", "senderName": "CEO", "text": "Wire funds immediately", "type": "text" } }
   ```
   *Expected*: PERMISSION_DENIED (`senderId != request.auth.uid`).

9. **Message Tampering / Deletion by Non-Sender**
   ```json
   { "path": "/conversations/c1/messages/m1", "action": "delete", "asUser": "other_user" }
   ```
   *Expected*: PERMISSION_DENIED (Messages immutable or author-only).

10. **Unauthenticated Read of Private Connection**
    ```json
    { "path": "/connections/conn_01", "action": "get", "auth": null }
    ```
    *Expected*: PERMISSION_DENIED (Requires authentication and participation).

11. **Invalid Meeting Room Code Injection**
    ```json
    { "path": "/meetings/m_bad", "data": { "roomCode": "bad code with spaces and $$$$$", "hostId": "auth_uid", "status": "active" } }
    ```
    *Expected*: PERMISSION_DENIED (roomCode regex mismatch).

12. **Global Default Deny Probe**
    ```json
    { "path": "/internal_admin_secrets/passwords", "action": "read" }
    ```
    *Expected*: PERMISSION_DENIED (Default catch-all deny).
